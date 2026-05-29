"use server";

import { prisma } from "@/lib/prisma";

export async function getShipments(estado?: string) {
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
  return prisma.shipment.update({
    where: { id },
    data: { estado, ...data },
  });
}
