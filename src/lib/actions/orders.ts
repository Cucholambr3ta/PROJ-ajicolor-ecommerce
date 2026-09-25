"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ORDER_TRANSITIONS } from "@/lib/state-machines";
import { revalidatePath } from "next/cache";
import { createOrderSchema, parseOrThrow } from "@/lib/schemas";
import { logAudit } from "@/lib/audit";
import type { EstadoPedido, CanalVenta } from "@prisma/client";

export async function getOrders(estado?: EstadoPedido | "Todos") {
  await requireAdmin();
  return prisma.order.findMany({
    where: estado && estado !== "Todos" ? { estado } : undefined,
    include: {
      customer: true,
      items: { include: { variant: { include: { product: true } } } },
      shipment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrderById(id: string) {
  await requireAdmin();
  return prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { variant: { include: { product: true } } } },
      shipment: true,
    },
  });
}

export async function updateOrderStatus(id: string, nuevoEstado: EstadoPedido) {
  const session = await requireAdmin();
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, shipment: true },
  });
  if (!order) throw new Error("Pedido no encontrado");

  const allowed = ORDER_TRANSITIONS[order.estado] ?? [];
  if (!allowed.includes(nuevoEstado)) {
    throw new Error(
      `Transición inválida: ${order.estado} → ${nuevoEstado}. Permitidos: ${allowed.join(", ") || "ninguno"}`
    );
  }

  // No se puede pasar a producción sin pago confirmado — la vía normal es
  // confirmPayment() (payments.ts), este guard blinda contra saltarse el
  // flujo cambiando el estado directo desde la UI del pedido.
  if (nuevoEstado === "EnProduccion" && order.estadoPago !== "Pagado") {
    throw new Error("No se puede pasar a producción sin confirmar el pago primero");
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (nuevoEstado === "Enviado" && !order.shipment) {
      await tx.shipment.create({ data: { orderId: order.id, metodo: order.metodoEnvio ?? undefined } });
    }

    if (nuevoEstado === "Cancelado") {
      // Si ya estaba pagado, revertir lo sumado a totalGastado. Si alguna
      // variante tenía stock reservado de un sobrante (createOrder manual),
      // devolverlo.
      if (order.estadoPago === "Pagado") {
        await tx.customer.update({
          where: { id: order.customerId },
          data: { totalGastado: { decrement: order.total } },
        });
      }
      for (const item of order.items) {
        const movimiento = await tx.stockMovement.findFirst({
          where: { descripcion: { contains: order.id } },
        });
        if (movimiento) {
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
              origen: "Cancelación",
              descripcion: `Pedido ${order.id} cancelado — devuelve sobrante reservado`,
            },
          });
        }
      }
    }

    return tx.order.update({ where: { id }, data: { estado: nuevoEstado } });
  });

  await logAudit({
    userId: session.user.id,
    entidad: "Order",
    entidadId: id,
    accion: `estado:${order.estado}->${nuevoEstado}`,
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/envios");
  revalidatePath("/admin");
  revalidatePath(`/pedido/${updated.numero}`);
  return updated;
}

export async function createOrder(data: {
  customerId: string;
  canal: CanalVenta;
  notas?: string;
  items: { variantId: string; cantidad: number; precioUnit: number }[];
}) {
  const session = await requireAdmin();
  const parsed = parseOrThrow(createOrderSchema, data);
  const total = parsed.items.reduce(
    (sum, item) => sum + item.cantidad * item.precioUnit,
    0
  );
  const userId = session.user.id;

  // Venta bajo pedido: solo se descuenta stock si hay piezas ya impresas
  // (sobrantes) que cubran la cantidad exacta. Si no hay stock, el pedido
  // se crea igual — entra a producción cuando se confirme el pago.
  const order = await prisma.$transaction(async (tx) => {
    for (const item of parsed.items) {
      const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
      if (variant && variant.stock > 0) {
        const result = await tx.productVariant.updateMany({
          where: { id: item.variantId, stock: { gte: item.cantidad } },
          data: { stock: { decrement: item.cantidad } },
        });
        if (result.count > 0) {
          await tx.stockMovement.create({
            data: {
              variantId: item.variantId,
              userId,
              cantidad: -item.cantidad,
              tipo: "Salida",
              origen: `Venta ${parsed.canal}`,
              descripcion: "Venta manual (sobrante)",
            },
          });
        }
      }
    }

    return tx.order.create({
      data: {
        customerId: parsed.customerId,
        canal: parsed.canal,
        notas: parsed.notas,
        subtotal: total,
        total,
        items: { create: parsed.items },
      },
      include: { items: true },
    });
  });

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return order;
}
