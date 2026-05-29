"use server";

import { prisma } from "@/lib/prisma";

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
  variants?: { talle: string; color: string; sku: string; stock?: number; stockMin?: number }[];
}) {
  return prisma.product.create({
    data: {
      nombreSlug: data.nombreSlug,
      descripcion: data.descripcion,
      disenoUrl: data.disenoUrl,
      artista: data.artista,
      temporada: data.temporada,
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
  }
) {
  return prisma.product.update({
    where: { id },
    data,
    include: { variants: true },
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}
