"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { SHIPMENT_TRANSITIONS } from "@/lib/state-machines";

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
  return prisma.shipment.create({
    data: {
      orderId: data.orderId,
      trackingNumber: data.trackingNumber,
      transportista: data.transportista,
      costo: data.costo,
      fechaEstimada: data.fechaEstimada,
    },
    include: { order: true },
  });
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

  return prisma.$transaction(async (tx) => {
    const updated = await tx.shipment.update({
      where: { id },
      data: { estado: nuevoEstado, ...data },
    });

    if (nuevoEstado === "Entregado") {
      await tx.order.update({
        where: { id: shipment.orderId },
        data: { estado: "Entregado" },
      });
    }

    return updated;
  });
}
