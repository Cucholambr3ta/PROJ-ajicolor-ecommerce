"use server";

import { prisma } from "@/lib/prisma";

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

export async function updateOrderStatus(id: string, estado: string) {
  return prisma.order.update({ where: { id }, data: { estado } });
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
