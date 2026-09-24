"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

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
  estado: string,
  data?: { trackingNumber?: string; fechaDespacho?: Date; fechaEntrega?: Date }
) {
  await requireAdmin();
  return prisma.shipment.update({
    where: { id },
    data: { estado, ...data },
  });
}
