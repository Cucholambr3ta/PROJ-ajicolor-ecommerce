"use server";

import { prisma } from "@/lib/prisma";

export async function getSuppliers() {
  return prisma.supplier.findMany({
    include: { batches: true },
    orderBy: { nombre: "asc" },
  });
}

export async function getSupplierById(id: string) {
  return prisma.supplier.findUnique({
    where: { id },
    include: { batches: { orderBy: { createdAt: "desc" } } },
  });
}

export async function createSupplier(data: {
  nombre: string;
  contacto: string;
  leadTimeDias: number;
  costoBase: number;
  calificacion: number;
}) {
  if (data.calificacion < 1 || data.calificacion > 5) {
    throw new Error("La calificación debe estar entre 1 y 5");
  }
  return prisma.supplier.create({ data });
}

export async function updateSupplier(
  id: string,
  data: {
    nombre?: string;
    contacto?: string;
    leadTimeDias?: number;
    costoBase?: number;
    calificacion?: number;
  }
) {
  if (data.calificacion != null && (data.calificacion < 1 || data.calificacion > 5)) {
    throw new Error("La calificación debe estar entre 1 y 5");
  }
  return prisma.supplier.update({ where: { id }, data });
}

export async function deleteSupplier(id: string) {
  const batchCount = await prisma.productionBatch.count({ where: { supplierId: id } });
  if (batchCount > 0) {
    throw new Error("No se puede eliminar un proveedor con lotes de producción asociados");
  }
  return prisma.supplier.delete({ where: { id } });
}
