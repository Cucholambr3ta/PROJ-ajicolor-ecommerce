"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

const BATCH_TRANSITIONS: Record<string, string[]> = {
  Solicitado: ["EnProgreso"],
  EnProgreso: ["Completado"],
  Completado: ["Recibido"],
  Recibido: [],
};

export async function getBatches(estado?: string) {
  await requireAdmin();
  return prisma.productionBatch.findMany({
    where: estado && estado !== "Todos" ? { estado } : undefined,
    include: { supplier: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBatchById(id: string) {
  await requireAdmin();
  return prisma.productionBatch.findUnique({ where: { id }, include: { supplier: true } });
}

export async function createBatch(data: {
  supplierId: string;
  variantes: string;
  unidadesPorVar: string;
  costoTotal: number;
  fechaEstimada: Date;
}) {
  await requireAdmin();
  const totalUnidades = data.unidadesPorVar
    .split(",")
    .map((u) => parseInt(u.trim(), 10) || 0)
    .reduce((a, b) => a + b, 0);
  if (totalUnidades < 10) {
    throw new Error("El lote debe tener un mínimo de 10 unidades");
  }
  return prisma.productionBatch.create({ data, include: { supplier: true } });
}

export async function updateBatchStatus(id: string, nuevoEstado: string, fechaRecepcion?: Date) {
  await requireAdmin();
  const batch = await prisma.productionBatch.findUnique({ where: { id } });
  if (!batch) throw new Error("Lote no encontrado");

  const allowed = BATCH_TRANSITIONS[batch.estado] ?? [];
  if (!allowed.includes(nuevoEstado)) {
    throw new Error(
      `Transición inválida: ${batch.estado} → ${nuevoEstado}. Permitidos: ${allowed.join(", ") || "ninguno"}`
    );
  }

  return prisma.productionBatch.update({
    where: { id },
    data: {
      estado: nuevoEstado,
      ...(nuevoEstado === "Recibido" ? { fechaRecepcion: fechaRecepcion ?? new Date() } : {}),
    },
  });
}
