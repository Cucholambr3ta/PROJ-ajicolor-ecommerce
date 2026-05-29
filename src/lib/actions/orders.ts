"use server";

import { prisma } from "@/lib/prisma";

const ORDER_TRANSITIONS: Record<string, string[]> = {
  Pendiente: ["Confirmado", "Cancelado"],
  Confirmado: ["EnProduccion", "Cancelado"],
  EnProduccion: ["Enviado", "Cancelado"],
  Enviado: ["Entregado"],
  Entregado: [],
  Cancelado: [],
};

export async function getOrders(estado?: string) {
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
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw new Error("Pedido no encontrado");

  const allowed = ORDER_TRANSITIONS[order.estado] ?? [];
  if (!allowed.includes(nuevoEstado)) {
    throw new Error(
      `Transición inválida: ${order.estado} → ${nuevoEstado}. Permitidos: ${allowed.join(", ") || "ninguno"}`
    );
  }

  return prisma.order.update({ where: { id }, data: { estado: nuevoEstado } });
}

export async function createOrder(data: {
  customerId: string;
  canal: string;
  notas?: string;
  items: { variantId: string; cantidad: number; precioUnit: number }[];
}) {
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
