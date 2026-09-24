"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { BATCH_TRANSITIONS } from "@/lib/state-machines";
import { revalidatePath } from "next/cache";
import { createBatchSchema, parseOrThrow } from "@/lib/schemas";

export async function getBatches(estado?: string) {
  await requireAdmin();
  return prisma.productionBatch.findMany({
    where: estado && estado !== "Todos" ? { estado } : undefined,
    include: { supplier: true, items: { include: { variant: { include: { product: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBatchById(id: string) {
  await requireAdmin();
  return prisma.productionBatch.findUnique({
    where: { id },
    include: { supplier: true, items: { include: { variant: { include: { product: true } } } } },
  });
}

export async function createBatch(data: {
  supplierId: string;
  fechaEstimada: Date;
  items: { variantId: string; cantidad: number; costoUnitario: number }[];
}) {
  await requireAdmin();
  const parsed = parseOrThrow(createBatchSchema, data);
  const totalUnidades = parsed.items.reduce((acc, item) => acc + item.cantidad, 0);
  if (totalUnidades < 10) {
    throw new Error("El lote debe tener un mínimo de 10 unidades");
  }
  const costoTotal = parsed.items.reduce((acc, item) => acc + item.cantidad * item.costoUnitario, 0);

  const batch = await prisma.productionBatch.create({
    data: {
      supplierId: parsed.supplierId,
      fechaEstimada: parsed.fechaEstimada,
      costoTotal,
      items: { create: parsed.items },
    },
    include: { supplier: true, items: { include: { variant: { include: { product: true } } } } },
  });
  revalidatePath("/admin/produccion");
  revalidatePath(`/admin/proveedores/${parsed.supplierId}`);
  return batch;
}

export async function updateBatchStatus(id: string, nuevoEstado: string, fechaRecepcion?: Date) {
  const session = await requireAdmin();
  const batch = await prisma.productionBatch.findUnique({ where: { id }, include: { items: true } });
  if (!batch) throw new Error("Lote no encontrado");

  const allowed = BATCH_TRANSITIONS[batch.estado] ?? [];
  if (!allowed.includes(nuevoEstado)) {
    throw new Error(
      `Transición inválida: ${batch.estado} → ${nuevoEstado}. Permitidos: ${allowed.join(", ") || "ninguno"}`
    );
  }

  let updated;
  if (nuevoEstado === "Recibido") {
    updated = await prisma.$transaction(async (tx) => {
      for (const item of batch.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.cantidad } },
        });
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            userId: (session.user as { id?: string } | undefined)?.id,
            cantidad: item.cantidad,
            tipo: "Entrada",
            origen: "Producción",
            descripcion: `Lote ${batch.id} recibido`,
          },
        });
      }
      return tx.productionBatch.update({
        where: { id },
        data: { estado: nuevoEstado, fechaRecepcion: fechaRecepcion ?? new Date() },
      });
    });
  } else {
    updated = await prisma.productionBatch.update({
      where: { id },
      data: { estado: nuevoEstado },
    });
  }

  revalidatePath("/admin/produccion");
  revalidatePath(`/admin/produccion/${id}`);
  revalidatePath("/admin/stock");
  revalidatePath("/admin");
  return updated;
}
