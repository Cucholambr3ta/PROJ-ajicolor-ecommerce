"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { updateCustomerSchema, registerCustomerSchema, parseOrThrow } from "@/lib/schemas";
import { type ActionResult, toActionResult } from "@/lib/action-result";
import { sendVerificationEmail } from "@/lib/actions/auth-recovery";

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
  const customer = await prisma.customer.update({
    where: { id },
    data: { backstagePass: true, backstagePassExpira: expira },
  });
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  return customer;
}

export async function desactivarBackstagePass(id: string) {
  await requireAdmin();
  const customer = await prisma.customer.update({
    where: { id },
    data: { backstagePass: false, backstagePassExpira: null },
  });
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  return customer;
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
  const parsed = parseOrThrow(updateCustomerSchema, data);
  const customer = await prisma.customer.update({
    where: { id },
    data: parsed,
  });
  revalidatePath("/admin/clientes");
  revalidatePath(`/admin/clientes/${id}`);
  return customer;
}

export async function registerCustomer(data: {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  direccion: string;
}): Promise<ActionResult<{ id: string; email: string }>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(registerCustomerSchema, data);
    const existing = await prisma.customer.findUnique({ where: { email: parsed.email } });
    if (existing) throw new Error("Ya existe una cuenta con ese email");

    const passwordHash = await hash(parsed.password, 12);

    const customer = await prisma.customer.create({
      data: {
        nombre: parsed.nombre,
        email: parsed.email,
        passwordHash,
        telefono: parsed.telefono,
        direccion: parsed.direccion,
      },
    });

    await sendVerificationEmail(customer.id);

    return { id: customer.id, email: customer.email };
  });
}
