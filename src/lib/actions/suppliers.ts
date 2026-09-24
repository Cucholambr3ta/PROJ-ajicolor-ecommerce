"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";

export async function getSuppliers() {
  await requireAdmin();
  return prisma.supplier.findMany({
    include: { batches: true },
    orderBy: { nombre: "asc" },
  });
}

export async function getSupplierById(id: string) {
  await requireAdmin();
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
  await requireAdmin();
  if (data.calificacion < 1 || data.calificacion > 5) {
    throw new Error("La calificación debe estar entre 1 y 5");
  }
  const supplier = await prisma.supplier.create({ data });
  revalidatePath("/admin/proveedores");
  return supplier;
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
  await requireAdmin();
  if (data.calificacion != null && (data.calificacion < 1 || data.calificacion > 5)) {
    throw new Error("La calificación debe estar entre 1 y 5");
  }
  const supplier = await prisma.supplier.update({ where: { id }, data });
  revalidatePath("/admin/proveedores");
  revalidatePath(`/admin/proveedores/${id}`);
  return supplier;
}

export async function deleteSupplier(id: string) {
  await requireAdmin();
  const batchCount = await prisma.productionBatch.count({ where: { supplierId: id } });
  if (batchCount > 0) {
    throw new Error("No se puede eliminar un proveedor con lotes de producción asociados");
  }
  const deleted = await prisma.supplier.delete({ where: { id } });
  revalidatePath("/admin/proveedores");
  return deleted;
}
