"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { createProductSchema, parseOrThrow } from "@/lib/schemas";

export async function getProducts() {
  return prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });
}

export async function createProduct(data: {
  nombreSlug: string;
  descripcion: string;
  disenoUrl: string;
  artista: string;
  temporada: string;
  precio: number;
  variants?: { talle: string; color: string; sku: string; stock?: number; stockMin?: number }[];
}) {
  await requireAdmin();
  const parsed = parseOrThrow(createProductSchema, data);
  const product = await prisma.product.create({
    data: {
      nombreSlug: parsed.nombreSlug,
      descripcion: parsed.descripcion,
      disenoUrl: parsed.disenoUrl,
      artista: parsed.artista,
      temporada: parsed.temporada,
      precio: parsed.precio,
      variants: parsed.variants ? { create: parsed.variants } : undefined,
    },
    include: { variants: true },
  });
  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  return product;
}

export async function updateProduct(
  id: string,
  data: {
    nombreSlug?: string;
    descripcion?: string;
    disenoUrl?: string;
    artista?: string;
    temporada?: string;
    precio?: number;
    variants?: {
      id?: string;
      talle: string;
      color: string;
      sku: string;
      stock: number;
      stockMin: number;
    }[];
  }
) {
  await requireAdmin();
  const { variants, ...productData } = data;

  return prisma.$transaction(async (tx) => {
    if (variants) {
      const existing = await tx.productVariant.findMany({ where: { productId: id }, select: { id: true } });
      const keepIds = variants.filter((v) => v.id).map((v) => v.id as string);
      const toDelete = existing.filter((v) => !keepIds.includes(v.id)).map((v) => v.id);
      if (toDelete.length > 0) {
        await tx.productVariant.deleteMany({ where: { id: { in: toDelete } } });
      }
      for (const v of variants) {
        if (v.id) {
          await tx.productVariant.update({
            where: { id: v.id },
            data: { talle: v.talle, color: v.color, sku: v.sku, stock: v.stock, stockMin: v.stockMin },
          });
        } else {
          await tx.productVariant.create({
            data: { productId: id, talle: v.talle, color: v.color, sku: v.sku, stock: v.stock, stockMin: v.stockMin },
          });
        }
      }
    }

    return tx.product.update({
      where: { id },
      data: productData,
      include: { variants: true },
    });
  }).then((product) => {
    revalidatePath("/admin/catalogo");
    revalidatePath(`/admin/catalogo/${id}`);
    revalidatePath(`/producto/${id}`);
    revalidatePath("/");
    return product;
  });
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const deleted = await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  return deleted;
}
