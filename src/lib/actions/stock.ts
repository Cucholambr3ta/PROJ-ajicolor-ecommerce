"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function getLowStock() {
  await requireAdmin();
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
  });
  return variants.filter((v) => v.stock <= v.stockMin);
}

export async function adjustStock(
  variantId: string,
  cantidad: number,
  tipo: "Entrada" | "Salida" | "Ajuste",
  origen: string,
  descripcion?: string
) {
  await requireAdmin();
  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) throw new Error("Variante no encontrada");

  const nuevoStock = variant.stock + cantidad;
  if (nuevoStock < 0) {
    throw new Error(`Stock insuficiente: actual ${variant.stock}, ajuste ${cantidad}`);
  }

  const [updatedVariant, movement] = await prisma.$transaction([
    prisma.productVariant.update({
      where: { id: variantId },
      data: { stock: nuevoStock },
    }),
    prisma.stockMovement.create({
      data: {
        variantId,
        cantidad,
        tipo,
        origen,
        descripcion: descripcion ?? null,
      },
    }),
  ]);

  revalidatePath("/admin/stock");
  revalidatePath("/admin");
  return { variant: updatedVariant, movement };
}
