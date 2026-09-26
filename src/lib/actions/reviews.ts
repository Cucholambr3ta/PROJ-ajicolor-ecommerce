"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireCliente } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseOrThrow } from "@/lib/schemas";
import { type ActionResult, toActionResult } from "@/lib/action-result";

const createReviewSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  calificacion: z.number().int().min(1).max(5),
  comentario: z.string().trim().max(1000).optional(),
});

/** Solo compradores de pedidos entregados pueden reseñar ese producto. */
export async function createReview(data: {
  orderId: string;
  productId: string;
  calificacion: number;
  comentario?: string;
}): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    const customerId = await requireCliente();
    const parsed = parseOrThrow(createReviewSchema, data);

    const order = await prisma.order.findUnique({
      where: { id: parsed.orderId },
      include: { items: { include: { variant: true } } },
    });
    if (!order || order.customerId !== customerId) throw new Error("Pedido no encontrado");
    if (order.estado !== "Entregado") throw new Error("Solo puedes reseñar pedidos entregados");

    const compró = order.items.some((item) => item.variant.productId === parsed.productId);
    if (!compró) throw new Error("Este producto no está en el pedido indicado");

    const existing = await prisma.review.findFirst({
      where: { orderId: parsed.orderId, productId: parsed.productId, customerId },
    });
    if (existing) throw new Error("Ya reseñaste este producto para este pedido");

    await prisma.review.create({
      data: {
        productId: parsed.productId,
        customerId,
        orderId: parsed.orderId,
        calificacion: parsed.calificacion,
        comentario: parsed.comentario,
      },
    });

    revalidatePath(`/pedido/${order.numero}`);
  });
}

/** Reseñas aprobadas de un producto, para mostrar en la ficha pública. */
export async function getApprovedReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId, aprobada: true },
    include: { customer: { select: { nombre: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPendingReviews() {
  await requireAdmin();
  return prisma.review.findMany({
    where: { aprobada: false },
    include: { customer: true, product: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function approveReview(id: string) {
  await requireAdmin();
  const review = await prisma.review.update({ where: { id }, data: { aprobada: true } });
  revalidatePath("/admin/resenas");
  revalidatePath(`/producto/${review.productId}`);
  return review;
}

export async function rejectReview(id: string) {
  await requireAdmin();
  const review = await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/resenas");
  return review;
}
