"use server";

import { prisma } from "@/lib/prisma";

export async function getCustomers() {
  await prisma.customer.updateMany({
    where: { backstagePass: true, backstagePassExpira: { lt: new Date() } },
    data: { backstagePass: false, backstagePassExpira: null },
  });
  return prisma.customer.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { fechaRegistro: "desc" },
  });
}

export async function getCustomerById(id: string) {
  await expireBackstagePassIfNeeded(id);
  return prisma.customer.findUnique({
    where: { id },
    include: { orders: { include: { items: true }, orderBy: { createdAt: "desc" } } },
  });
}

async function expireBackstagePassIfNeeded(id: string) {
  await prisma.customer.updateMany({
    where: { id, backstagePass: true, backstagePassExpira: { lt: new Date() } },
    data: { backstagePass: false, backstagePassExpira: null },
  });
}

export async function activarBackstagePass(id: string) {
  const expira = new Date();
  expira.setDate(expira.getDate() + 30);
  return prisma.customer.update({
    where: { id },
    data: { backstagePass: true, backstagePassExpira: expira },
  });
}

export async function desactivarBackstagePass(id: string) {
  return prisma.customer.update({
    where: { id },
    data: { backstagePass: false, backstagePassExpira: null },
  });
}

export async function getCustomerOrders(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    include: {
      items: { include: { variant: { include: { product: true } } } },
      shipment: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateCustomer(
  id: string,
  data: {
    nombre?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    backstagePass?: boolean;
  }
) {
  return prisma.customer.update({
    where: { id },
    data,
  });
}
