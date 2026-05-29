"use server";

import { prisma } from "@/lib/prisma";

const BATCH_TRANSITIONS: Record<string, string[]> = {
  Solicitado: ["EnProgreso"],
  EnProgreso: ["Completado"],
  Completado: ["Recibido"],
  Recibido: [],
};

export async function getBatches(estado?: string) {
  return prisma.productionBatch.findMany({
    where: estado && estado !== "Todos" ? { estado } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getBatchById(id: string) {
  return prisma.productionBatch.findUnique({ where: { id } });
}

export async function createBatch(data: {
  proveedor: string;
  variantes: string;
  unidadesPorVar: string;
  costoTotal: number;
  fechaEstimada: Date;
}) {
  return prisma.productionBatch.create({ data });
}

export async function updateBatchStatus(id: string, nuevoEstado: string, fechaRecepcion?: Date) {
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
      ...(nuevoEstado === "Recibido" && fechaRecepcion ? { fechaRecepcion } : {}),
      ...(nuevoEstado === "Recibido" ? { fechaRecepcion: new Date() } : {}),
    },
  });
}
