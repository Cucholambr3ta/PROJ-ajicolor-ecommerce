"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseOrThrow } from "@/lib/schemas";

const createBannerSchema = z.object({
  imageUrl: z.string().trim().min(1).max(500),
  linkUrl: z.string().trim().min(1).max(500),
});

export async function getBanners() {
  await requireAdmin();
  return prisma.banner.findMany({ orderBy: { orden: "asc" } });
}

/** Banners activos para el carrusel público del home, ya ordenados. */
export async function getActiveBanners() {
  return prisma.banner.findMany({
    where: { activo: true },
    orderBy: { orden: "asc" },
  });
}

export async function createBanner(formData: FormData) {
  await requireAdmin();

  const linkUrl = formData.get("linkUrl");
  const file = formData.get("file");
  if (typeof linkUrl !== "string" || !(file instanceof File) || file.size === 0) {
    throw new Error("Falta la imagen o el enlace del banner");
  }

  const { uploadBannerImage } = await import("@/lib/storage");
  const imageUrl = await uploadBannerImage(file);
  const parsed = parseOrThrow(createBannerSchema, { imageUrl, linkUrl });

  const ultimo = await prisma.banner.findFirst({ orderBy: { orden: "desc" }, select: { orden: true } });
  const banner = await prisma.banner.create({
    data: { imageUrl: parsed.imageUrl, linkUrl: parsed.linkUrl, orden: (ultimo?.orden ?? -1) + 1 },
  });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return banner;
}

export async function updateBanner(id: string, data: { linkUrl?: string; activo?: boolean }) {
  await requireAdmin();
  const banner = await prisma.banner.update({ where: { id }, data });
  revalidatePath("/admin/banners");
  revalidatePath("/");
  return banner;
}

/** Intercambia el orden de dos banners (mover arriba/abajo en la lista). */
export async function swapBannerOrder(id: string, direction: "up" | "down") {
  await requireAdmin();

  const banners = await prisma.banner.findMany({ orderBy: { orden: "asc" } });
  const index = banners.findIndex((b) => b.id === id);
  if (index === -1) throw new Error("Banner no encontrado");

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= banners.length) return;

  const current = banners[index];
  const target = banners[targetIndex];

  await prisma.$transaction([
    prisma.banner.update({ where: { id: current.id }, data: { orden: target.orden } }),
    prisma.banner.update({ where: { id: target.id }, data: { orden: current.orden } }),
  ]);

  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBanner(id: string) {
  await requireAdmin();
  const banner = await prisma.banner.delete({ where: { id } });

  const { deleteBannerImage } = await import("@/lib/storage");
  await deleteBannerImage(banner.imageUrl);

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return banner;
}
