"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseOrThrow } from "@/lib/schemas";

const couponAdminSchema = z.object({
  codigo: z.string().trim().min(1, "El código es obligatorio").max(50).toUpperCase(),
  tipo: z.enum(["porcentaje", "monto", "envio_gratis"]),
  valor: z.number().nonnegative(),
  montoMinimo: z.number().nonnegative().optional(),
  usosMaximos: z.number().int().positive().optional(),
  vigenteDesde: z.date().optional(),
  vigenteHasta: z.date().optional(),
  activo: z.boolean().optional(),
});

export async function getCouponsAdmin() {
  await requireAdmin();
  return prisma.coupon.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createCoupon(data: {
  codigo: string;
  tipo: "porcentaje" | "monto" | "envio_gratis";
  valor: number;
  montoMinimo?: number;
  usosMaximos?: number;
  vigenteDesde?: Date;
  vigenteHasta?: Date;
}) {
  await requireAdmin();
  const parsed = parseOrThrow(couponAdminSchema, data);
  const existing = await prisma.coupon.findUnique({ where: { codigo: parsed.codigo } });
  if (existing) throw new Error("Ya existe un cupón con ese código");
  const coupon = await prisma.coupon.create({ data: parsed });
  revalidatePath("/admin/cupones");
  return coupon;
}

export async function updateCoupon(
  id: string,
  data: {
    valor?: number;
    montoMinimo?: number;
    usosMaximos?: number;
    vigenteHasta?: Date;
    activo?: boolean;
  }
) {
  await requireAdmin();
  const coupon = await prisma.coupon.update({ where: { id }, data });
  revalidatePath("/admin/cupones");
  return coupon;
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  const deleted = await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/cupones");
  return deleted;
}
