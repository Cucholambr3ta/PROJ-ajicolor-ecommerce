"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { BATCH_TRANSITIONS } from "@/lib/state-machines";
import { revalidatePath } from "next/cache";
import { createBatchSchema, parseOrThrow } from "@/lib/schemas";
import type { EstadoLote } from "@prisma/client";

export async function getBatches(estado?: EstadoLote | "Todos") {
  await requireAdmin();
  return prisma.productionBatch.findMany({
    where: estado && estado !== "Todos" ? { estado } : undefined,
    include: { supplier: true, items: { include: { variant: { include: { product: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBatchById(id: string) {
  await requireAdmin();
  return prisma.productionBatch.findUnique({
    where: { id },
    include: { supplier: true, items: { include: { variant: { include: { product: true } } } } },
  });
}

export async function createBatch(data: {
  supplierId: string;
  fechaEstimada: Date;
  items: { variantId: string; cantidad: number; costoUnitario: number; orderItemId?: string }[];
}) {
  await requireAdmin();
  const parsed = parseOrThrow(createBatchSchema, data);
  // Venta bajo pedido: sin piso mínimo de unidades — un lote puede ser tan
  // chico como lo que efectivamente se vendió y se pagó.
  const costoTotal = parsed.items.reduce((acc, item) => acc + item.cantidad * item.costoUnitario, 0);

  const batch = await prisma.productionBatch.create({
    data: {
      supplierId: parsed.supplierId,
      fechaEstimada: parsed.fechaEstimada,
      costoTotal,
      items: {
        create: data.items.map((item) => ({
          variantId: item.variantId,
          cantidad: item.cantidad,
          costoUnitario: item.costoUnitario,
          orderItemId: item.orderItemId,
        })),
      },
    },
    include: { supplier: true, items: { include: { variant: { include: { product: true } } } } },
  });
  revalidatePath("/admin/produccion");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/proveedores/${parsed.supplierId}`);
  return batch;
}

/**
 * Ítems de pedidos pagados que todavía no fueron asignados a ningún lote de
 * producción — la cola real de "qué hay que imprimir" del negocio bajo
 * pedido, agrupada por variante para facilitar armar un lote conjunto.
 */
export async function getItemsPorProducir() {
  await requireAdmin();
  const items = await prisma.orderItem.findMany({
    where: {
      order: { estadoPago: "Pagado", estado: { in: ["Pagado", "EnProduccion"] } },
      batchItems: { none: {} },
    },
    include: {
      order: { include: { customer: true } },
      variant: { include: { product: true } },
    },
    orderBy: { order: { pagadoAt: "asc" } },
  });

  const porVariante = new Map<
    string,
    { variantId: string; label: string; cantidad: number; costoUnitario: number; orderItemIds: string[] }
  >();

  for (const item of items) {
    const key = item.variantId;
    const existing = porVariante.get(key);
    if (existing) {
      existing.cantidad += item.cantidad;
      existing.orderItemIds.push(item.id);
    } else {
      porVariante.set(key, {
        variantId: item.variantId,
        label: `${item.variant.product.nombre} — ${item.variant.color} / ${item.variant.talle}`,
        cantidad: item.cantidad,
        costoUnitario: Number(item.costoUnit),
        orderItemIds: [item.id],
      });
    }
  }

  return { items, agrupadoPorVariante: Array.from(porVariante.values()) };
}

export async function updateBatchStatus(id: string, nuevoEstado: EstadoLote, fechaRecepcion?: Date) {
  const session = await requireAdmin();
  const batch = await prisma.productionBatch.findUnique({
    where: { id },
    include: { items: { include: { orderItem: { include: { order: true } } } } },
  });
  if (!batch) throw new Error("Lote no encontrado");

  const allowed = BATCH_TRANSITIONS[batch.estado] ?? [];
  if (!allowed.includes(nuevoEstado)) {
    throw new Error(
      `Transición inválida: ${batch.estado} → ${nuevoEstado}. Permitidos: ${allowed.join(", ") || "ninguno"}`
    );
  }

  let updated;
  if (nuevoEstado === "Recibido") {
    updated = await prisma.$transaction(async (tx) => {
      const ordenesAfectadas = new Set<string>();

      for (const item of batch.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.cantidad } },
        });
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            userId: session.user.id,
            cantidad: item.cantidad,
            tipo: "Entrada",
            origen: "Producción",
            descripcion: `Lote ${batch.id} recibido`,
          },
        });
        if (item.orderItem) ordenesAfectadas.add(item.orderItem.orderId);
      }

      // Si todos los ítems de un pedido ya fueron cubiertos por lotes
      // recibidos, el pedido pasa a listo para enviar.
      for (const orderId of Array.from(ordenesAfectadas)) {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId },
          include: { batchItems: { include: { batch: true } } },
        });
        const todoCubierto = orderItems.every((oi) =>
          oi.batchItems.some((bi) => bi.batch.estado === "Recibido" || bi.batchId === batch.id)
        );
        if (todoCubierto) {
          const order = await tx.order.findUnique({ where: { id: orderId } });
          if (order?.estado === "EnProduccion") {
            await tx.order.update({ where: { id: orderId }, data: { estado: "ListoParaEnvio" } });
          }
        }
      }

      return tx.productionBatch.update({
        where: { id },
        data: { estado: nuevoEstado, fechaRecepcion: fechaRecepcion ?? new Date() },
      });
    });
  } else {
    updated = await prisma.productionBatch.update({
      where: { id },
      data: { estado: nuevoEstado },
    });
  }

  revalidatePath("/admin/produccion");
  revalidatePath(`/admin/produccion/${id}`);
  revalidatePath("/admin/stock");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return updated;
}
