"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseOrThrow } from "@/lib/schemas";

const collectionSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "El slug solo puede tener minúsculas, números y guiones"),
  descripcion: z.string().trim().max(1000).optional(),
  fechaLanzamiento: z.date().optional(),
  fechaCierre: z.date().optional(),
  activa: z.boolean().optional(),
});

export async function getCollectionsAdmin() {
  await requireAdmin();
  return prisma.collection.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCollectionById(id: string) {
  await requireAdmin();
  return prisma.collection.findUnique({
    where: { id },
    include: { products: true },
  });
}

export async function createCollection(data: {
  nombre: string;
  slug: string;
  descripcion?: string;
  fechaLanzamiento?: Date;
  fechaCierre?: Date;
  activa?: boolean;
}) {
  await requireAdmin();
  const parsed = parseOrThrow(collectionSchema, data);
  const collection = await prisma.collection.create({ data: parsed });
  revalidatePath("/admin/colecciones");
  revalidatePath("/");
  return collection;
}

export async function updateCollection(
  id: string,
  data: {
    nombre?: string;
    slug?: string;
    descripcion?: string;
    fechaLanzamiento?: Date;
    fechaCierre?: Date;
    activa?: boolean;
  }
) {
  await requireAdmin();
  const collection = await prisma.collection.update({ where: { id }, data });
  revalidatePath("/admin/colecciones");
  revalidatePath(`/admin/colecciones/${id}`);
  revalidatePath("/");
  return collection;
}

export async function deleteCollection(id: string) {
  await requireAdmin();
  const count = await prisma.product.count({ where: { collectionId: id } });
  if (count > 0) throw new Error("No se puede eliminar: hay productos asociados a esta colección");
  const deleted = await prisma.collection.delete({ where: { id } });
  revalidatePath("/admin/colecciones");
  revalidatePath("/");
  return deleted;
}
