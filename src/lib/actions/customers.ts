"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { requireAdmin } from "@/lib/auth-guard";

export async function getCustomers() {
  await requireAdmin();
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
  await requireAdmin();
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
  await requireAdmin();
  const expira = new Date();
  expira.setDate(expira.getDate() + 30);
  return prisma.customer.update({
    where: { id },
    data: { backstagePass: true, backstagePassExpira: expira },
  });
}

export async function desactivarBackstagePass(id: string) {
  await requireAdmin();
  return prisma.customer.update({
    where: { id },
    data: { backstagePass: false, backstagePassExpira: null },
  });
}

export async function getCustomerOrders(customerId: string) {
  await requireAdmin();
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
  await requireAdmin();
  return prisma.customer.update({
    where: { id },
    data,
  });
}

export async function registerCustomer(data: {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  direccion: string;
}) {
  const existing = await prisma.customer.findUnique({ where: { email: data.email } });
  if (existing) throw new Error("Ya existe una cuenta con ese email");

  const passwordHash = await hash(data.password, 12);

  return prisma.customer.create({
    data: {
      nombre: data.nombre,
      email: data.email,
      passwordHash,
      telefono: data.telefono,
      direccion: data.direccion,
    },
  });
}
