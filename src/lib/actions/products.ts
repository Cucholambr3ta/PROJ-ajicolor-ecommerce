"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

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
  return prisma.product.create({
    data: {
      nombreSlug: data.nombreSlug,
      descripcion: data.descripcion,
      disenoUrl: data.disenoUrl,
      artista: data.artista,
      temporada: data.temporada,
      precio: data.precio,
      variants: data.variants ? { create: data.variants } : undefined,
    },
    include: { variants: true },
  });
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
  }
) {
  await requireAdmin();
  return prisma.product.update({
    where: { id },
    data,
    include: { variants: true },
  });
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  return prisma.product.delete({ where: { id } });
}
