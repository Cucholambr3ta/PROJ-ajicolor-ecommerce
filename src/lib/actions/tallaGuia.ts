"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import type { CategoriaProducto, TipoProducto } from "@prisma/client";

export async function getTallaGuias() {
  await requireAdmin();
  return prisma.tallaGuia.findMany({ orderBy: [{ tipo: "asc" }, { categoria: "asc" }] });
}

/** Sin auth — la ficha pública necesita saber si hay imagen guía para este
 * tipo+categoría antes de mostrar el botón/modal. */
export async function getTallaGuiasPublic() {
  return prisma.tallaGuia.findMany();
}

export async function setTallaGuia(tipo: TipoProducto, categoria: CategoriaProducto, formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) throw new Error("Falta la imagen");

  const { uploadTallaGuiaImage } = await import("@/lib/storage");
  const imageUrl = await uploadTallaGuiaImage(file);

  const guia = await prisma.tallaGuia.upsert({
    where: { tipo_categoria: { tipo, categoria } },
    create: { tipo, categoria, imageUrl },
    update: { imageUrl },
  });

  revalidatePath("/admin/precios");
  revalidatePath("/");
  return guia;
}

export async function deleteTallaGuia(id: string) {
  await requireAdmin();
  const guia = await prisma.tallaGuia.delete({ where: { id } });
  revalidatePath("/admin/precios");
  revalidatePath("/");
  return guia;
}
