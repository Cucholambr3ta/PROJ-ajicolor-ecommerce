"use server";

import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { requireCliente } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import {
  updateOwnProfileSchema,
  changePasswordSchema,
  addressSchema,
  parseOrThrow,
} from "@/lib/schemas";
import { type ActionResult, toActionResult } from "@/lib/action-result";

export async function getOwnProfile() {
  const customerId = await requireCliente();
  return prisma.customer.findUnique({ where: { id: customerId } });
}

export async function updateOwnProfile(data: {
  nombre: string;
  telefono?: string;
  direccion?: string;
}): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    const customerId = await requireCliente();
    const parsed = parseOrThrow(updateOwnProfileSchema, data);
    await prisma.customer.update({ where: { id: customerId }, data: parsed });
    revalidatePath("/cuenta");
  });
}

export async function changeOwnPassword(data: {
  passwordActual: string;
  passwordNueva: string;
}): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    const customerId = await requireCliente();
    const parsed = parseOrThrow(changePasswordSchema, data);

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer?.passwordHash) {
      throw new Error("Esta cuenta inició sesión con Google y no tiene contraseña propia");
    }

    const valid = await compare(parsed.passwordActual, customer.passwordHash);
    if (!valid) throw new Error("La contraseña actual no es correcta");

    const passwordHash = await hash(parsed.passwordNueva, 12);
    await prisma.customer.update({ where: { id: customerId }, data: { passwordHash } });
    revalidatePath("/cuenta");
  });
}

export async function getOwnAddresses() {
  const customerId = await requireCliente();
  return prisma.address.findMany({
    where: { customerId },
    orderBy: [{ esPrincipal: "desc" }, { createdAt: "desc" }],
  });
}

export async function createOwnAddress(data: {
  etiqueta?: string;
  nombre: string;
  telefono: string;
  calle: string;
  numero: string;
  comuna: string;
  region: string;
  esPrincipal?: boolean;
}): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    const customerId = await requireCliente();
    const parsed = parseOrThrow(addressSchema, data);

    if (parsed.esPrincipal) {
      await prisma.address.updateMany({ where: { customerId }, data: { esPrincipal: false } });
    }

    await prisma.address.create({ data: { ...parsed, customerId } });
    revalidatePath("/cuenta");
  });
}

async function assertOwnsAddress(addressId: string, customerId: string) {
  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.customerId !== customerId) throw new Error("Dirección no encontrada");
  return address;
}

export async function deleteOwnAddress(addressId: string): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    const customerId = await requireCliente();
    await assertOwnsAddress(addressId, customerId);
    await prisma.address.delete({ where: { id: addressId } });
    revalidatePath("/cuenta");
  });
}

export async function setPrincipalAddress(addressId: string): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    const customerId = await requireCliente();
    await assertOwnsAddress(addressId, customerId);
    await prisma.$transaction([
      prisma.address.updateMany({ where: { customerId }, data: { esPrincipal: false } }),
      prisma.address.update({ where: { id: addressId }, data: { esPrincipal: true } }),
    ]);
    revalidatePath("/cuenta");
  });
}

export async function getOwnFavorites() {
  const customerId = await requireCliente();
  return prisma.favorite.findMany({
    where: { customerId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleFavorite(productId: string): Promise<ActionResult<{ favorited: boolean }>> {
  return toActionResult(async () => {
    const customerId = await requireCliente();
    const existing = await prisma.favorite.findUnique({
      where: { customerId_productId: { customerId, productId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      revalidatePath("/cuenta");
      return { favorited: false };
    }

    await prisma.favorite.create({ data: { customerId, productId } });
    revalidatePath("/cuenta");
    return { favorited: true };
  });
}
