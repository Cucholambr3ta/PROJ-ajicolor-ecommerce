"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { SHIPMENT_TRANSITIONS } from "@/lib/state-machines";
import { revalidatePath } from "next/cache";
import { createShipmentSchema, parseOrThrow } from "@/lib/schemas";

export async function getShipments(estado?: string) {
  await requireAdmin();
  return prisma.shipment.findMany({
    where: estado && estado !== "Todos" ? { estado } : undefined,
    include: { order: { include: { customer: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function createShipment(data: {
  orderId: string;
  trackingNumber?: string;
  transportista?: string;
  costo?: number;
  fechaEstimada?: Date;
}) {
  await requireAdmin();
  const parsed = parseOrThrow(createShipmentSchema, data);
  const shipment = await prisma.shipment.create({
    data: {
      orderId: parsed.orderId,
      trackingNumber: parsed.trackingNumber,
      transportista: parsed.transportista,
      costo: parsed.costo,
      fechaEstimada: parsed.fechaEstimada,
    },
    include: { order: true },
  });
  revalidatePath("/admin/envios");
  revalidatePath(`/admin/pedidos/${parsed.orderId}`);
  return shipment;
}

export async function updateShipmentDetails(
  id: string,
  data: { trackingNumber?: string; transportista?: string; costo?: number }
) {
  await requireAdmin();
  const updated = await prisma.shipment.update({ where: { id }, data });
  revalidatePath("/admin/envios");
  revalidatePath(`/admin/envios/${id}`);
  return updated;
}

export async function updateShipmentStatus(
  id: string,
  nuevoEstado: string,
  data?: { trackingNumber?: string; fechaDespacho?: Date; fechaEntrega?: Date }
) {
  await requireAdmin();
  const shipment = await prisma.shipment.findUnique({ where: { id } });
  if (!shipment) throw new Error("Envío no encontrado");

  const allowed = SHIPMENT_TRANSITIONS[shipment.estado] ?? [];
  if (!allowed.includes(nuevoEstado)) {
    throw new Error(
      `Transición inválida: ${shipment.estado} → ${nuevoEstado}. Permitidos: ${allowed.join(", ") || "ninguno"}`
    );
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.shipment.update({
      where: { id },
      data: { estado: nuevoEstado, ...data },
    });

    if (nuevoEstado === "Entregado") {
      await tx.order.update({
        where: { id: shipment.orderId },
        data: { estado: "Entregado" },
      });
    }

    return result;
  });

  revalidatePath("/admin/envios");
  revalidatePath(`/admin/envios/${id}`);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${shipment.orderId}`);
  revalidatePath("/admin");
  return updated;
}
