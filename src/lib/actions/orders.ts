"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ORDER_TRANSITIONS } from "@/lib/state-machines";
import { revalidatePath } from "next/cache";
import { createOrderSchema, parseOrThrow } from "@/lib/schemas";
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

  // TODO(Fase 3): venta bajo pedido — al cancelar ya no hay stock reservado
  // que devolver (el checkout no descuenta stock). Esta rama queda para
  // cuando se conecte con la cola de producción y el stock de sobrantes.
  const updated = await prisma.$transaction(async (tx) => {
    if (nuevoEstado === "Enviado" && !order.shipment) {
      await tx.shipment.create({ data: { orderId: order.id } });
    }

    return tx.order.update({ where: { id }, data: { estado: nuevoEstado } });
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  revalidatePath("/admin/envios");
  revalidatePath("/admin");
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

  // TODO(Fase 3): venta bajo pedido — esta venta manual ya no debería
  // descontar stock salvo que se esté asignando una pieza ya impresa
  // (sobrante). Se ajusta junto con el checkout público.
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
