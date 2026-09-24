"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { ORDER_TRANSITIONS } from "@/lib/state-machines";

export async function getOrders(estado?: string) {
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

export async function updateOrderStatus(id: string, nuevoEstado: string) {
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

  return prisma.$transaction(async (tx) => {
    if (nuevoEstado === "Cancelado") {
      const userId = (session.user as { id?: string } | undefined)?.id;
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.cantidad } },
        });
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            userId,
            cantidad: item.cantidad,
            tipo: "Entrada",
            origen: "Cancelación",
            descripcion: `Pedido ${order.id} cancelado`,
          },
        });
      }
    }

    if (nuevoEstado === "Enviado" && !order.shipment) {
      await tx.shipment.create({ data: { orderId: order.id } });
    }

    return tx.order.update({ where: { id }, data: { estado: nuevoEstado } });
  });
}

export async function createOrder(data: {
  customerId: string;
  canal: string;
  notas?: string;
  items: { variantId: string; cantidad: number; precioUnit: number }[];
}) {
  await requireAdmin();
  const total = data.items.reduce(
    (sum, item) => sum + item.cantidad * item.precioUnit,
    0
  );
  return prisma.order.create({
    data: {
      customerId: data.customerId,
      canal: data.canal,
      notas: data.notas,
      total,
      items: { create: data.items },
    },
    include: { items: true },
  });
}
