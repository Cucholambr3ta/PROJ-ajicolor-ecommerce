"use server";

import { prisma } from "@/lib/prisma";

export async function getBatches(estado?: string) {
  return prisma.productionBatch.findMany({
    where: estado && estado !== "Todos" ? { estado } : undefined,
    orderBy: { createdAt: "desc" },
  });
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

export async function updateBatchStatus(id: string, estado: string, fechaRecepcion?: Date) {
  return prisma.productionBatch.update({
    where: { id },
    data: { estado, ...(fechaRecepcion ? { fechaRecepcion } : {}) },
  });
}
