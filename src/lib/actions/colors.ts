"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseOrThrow } from "@/lib/schemas";
import type { CategoriaProducto } from "@prisma/client";

const createColorSchema = z.object({
  nombre: z.string().trim().min(1).max(60),
  hex: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, "El color debe ser un hex válido, ej. #4F266A"),
  categoria: z.enum(["Adulto", "Kids"]),
});

export async function getColors(categoria?: CategoriaProducto) {
  await requireAdmin();
  return prisma.color.findMany({
    where: categoria ? { categoria } : undefined,
    orderBy: [{ categoria: "asc" }, { nombre: "asc" }],
  });
}

/** Paleta pública por categoría — usada por la ficha de producto (sin auth). */
export async function getColorsPublic(categoria: CategoriaProducto) {
  return prisma.color.findMany({
    where: { categoria },
    orderBy: { nombre: "asc" },
  });
}

export async function createColor(data: { nombre: string; hex: string; categoria: CategoriaProducto }) {
  await requireAdmin();
  const parsed = parseOrThrow(createColorSchema, data);
  const color = await prisma.color.create({ data: parsed });
  revalidatePath("/admin/colores");
  return color;
}

export async function updateColor(id: string, data: { nombre?: string; hex?: string }) {
  await requireAdmin();
  const color = await prisma.color.update({ where: { id }, data });
  revalidatePath("/admin/colores");
  return color;
}

export async function deleteColor(id: string) {
  await requireAdmin();
  const color = await prisma.color.delete({ where: { id } });
  revalidatePath("/admin/colores");
  return color;
}
