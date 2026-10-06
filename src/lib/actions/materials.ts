"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseOrThrow } from "@/lib/schemas";

const materialSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  unidad: z.string().trim().min(1, "La unidad es obligatoria").max(30),
  costo: z.number().nonnegative(),
  supplierId: z.string().trim().min(1).optional(),
});

const movementSchema = z.object({
  materialId: z.string().min(1),
  cantidad: z.number(),
  tipo: z.enum(["Entrada", "Salida", "Ajuste"]),
  origen: z.string().trim().min(1).max(200),
  descripcion: z.string().trim().max(500).optional(),
  costoTotal: z.number().nonnegative().optional(),
});

export async function getMaterials() {
  await requireAdmin();
  return prisma.material.findMany({
    include: { supplier: true, _count: { select: { movements: true } } },
    orderBy: { nombre: "asc" },
  });
}

export async function createMaterial(data: {
  nombre: string;
  unidad: string;
  costo: number;
  supplierId?: string;
}) {
  await requireAdmin();
  const parsed = parseOrThrow(materialSchema, data);
  const material = await prisma.material.create({ data: parsed });
  revalidatePath("/admin/insumos");
  return material;
}

export async function updateMaterial(
  id: string,
  data: { nombre?: string; unidad?: string; costo?: number; supplierId?: string | null }
) {
  await requireAdmin();
  const material = await prisma.material.update({ where: { id }, data });
  revalidatePath("/admin/insumos");
  return material;
}

export async function deleteMaterial(id: string) {
  await requireAdmin();
  const count = await prisma.materialMovement.count({ where: { materialId: id } });
  if (count > 0) throw new Error("No se puede eliminar: tiene movimientos registrados");
  const deleted = await prisma.material.delete({ where: { id } });
  revalidatePath("/admin/insumos");
  return deleted;
}

/** Registra consumo/reposición de un insumo y actualiza su stock en la misma transacción. */
export async function createMaterialMovement(data: {
  materialId: string;
  cantidad: number;
  tipo: "Entrada" | "Salida" | "Ajuste";
  origen: string;
  descripcion?: string;
  costoTotal?: number;
}) {
  await requireAdmin();
  const parsed = parseOrThrow(movementSchema, data);

  const material = await prisma.material.findUnique({ where: { id: parsed.materialId } });
  if (!material) throw new Error("Insumo no encontrado");

  const delta = parsed.tipo === "Salida" ? -Math.abs(parsed.cantidad) : Math.abs(parsed.cantidad);
  const nuevoStock = Number(material.stock) + delta;
  if (nuevoStock < 0) throw new Error(`Stock insuficiente: actual ${material.stock}, movimiento ${delta}`);

  const [updated, movement] = await prisma.$transaction([
    prisma.material.update({ where: { id: parsed.materialId }, data: { stock: nuevoStock } }),
    prisma.materialMovement.create({
      data: {
        materialId: parsed.materialId,
        cantidad: delta,
        tipo: parsed.tipo,
        origen: parsed.origen,
        descripcion: parsed.descripcion,
        // El costo solo tiene sentido en compras (Entrada) — se ignora en
        // Salida/Ajuste aunque venga en el formulario.
        costoTotal: parsed.tipo === "Entrada" ? parsed.costoTotal : undefined,
      },
    }),
  ]);

  revalidatePath("/admin/insumos");
  return { material: updated, movement };
}

export async function getMaterialMovements(materialId: string) {
  await requireAdmin();
  const movements = await prisma.materialMovement.findMany({
    where: { materialId },
    orderBy: { createdAt: "desc" },
  });
  return movements.map((m) => ({ ...m, cantidad: Number(m.cantidad), costoTotal: m.costoTotal != null ? Number(m.costoTotal) : null }));
}

/** Gasto total en compras de insumos (Entrada con costoTotal) agrupado por proveedor, en el período dado. */
export async function getGastoPorProveedor(desde?: Date, hasta?: Date) {
  await requireAdmin();
  const movimientos = await prisma.materialMovement.findMany({
    where: {
      tipo: "Entrada",
      costoTotal: { not: null },
      ...(desde || hasta ? { createdAt: { gte: desde, lte: hasta } } : {}),
    },
    include: { material: { include: { supplier: true } } },
    orderBy: { createdAt: "desc" },
  });

  const porProveedor = new Map<string, { proveedor: string; total: number; compras: number }>();
  for (const mov of movimientos) {
    const key = mov.material.supplier?.id ?? "sin-proveedor";
    const nombre = mov.material.supplier?.nombre ?? "Sin proveedor asignado";
    const existing = porProveedor.get(key);
    const monto = Number(mov.costoTotal ?? 0);
    if (existing) {
      existing.total += monto;
      existing.compras += 1;
    } else {
      porProveedor.set(key, { proveedor: nombre, total: monto, compras: 1 });
    }
  }

  const porProveedorArr = Array.from(porProveedor.values()).sort((a, b) => b.total - a.total);
  const totalGeneral = porProveedorArr.reduce((sum, p) => sum + p.total, 0);

  return {
    porProveedor: porProveedorArr,
    totalGeneral,
    movimientos: movimientos.map((m) => ({
      id: m.id,
      fecha: m.createdAt,
      insumo: m.material.nombre,
      proveedor: m.material.supplier?.nombre ?? "Sin proveedor",
      cantidad: Number(m.cantidad),
      unidad: m.material.unidad,
      costoTotal: Number(m.costoTotal ?? 0),
    })),
  };
}
