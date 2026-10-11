"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { SHIPMENT_TRANSITIONS } from "@/lib/state-machines";
import { revalidatePath } from "next/cache";
import { createShipmentSchema, parseOrThrow } from "@/lib/schemas";
import type { EstadoEnvio, ResolucionDevolucion } from "@prisma/client";
import { sendEmail } from "@/lib/email/send";
import { pedidoEnviadoTemplate, pedidoEntregadoTemplate } from "@/lib/email/templates";
import { logAudit } from "@/lib/audit";

export async function getShipments(estado?: EstadoEnvio | "Todos") {
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
  nuevoEstado: EstadoEnvio,
  data?: { trackingNumber?: string; fechaDespacho?: Date; fechaEntrega?: Date }
) {
  await requireAdmin();
  const shipment = await prisma.shipment.findUnique({ where: { id }, include: { order: { include: { customer: true } } } });
  if (!shipment) throw new Error("Envío no encontrado");

  const allowed = SHIPMENT_TRANSITIONS[shipment.estado] ?? [];
  if (!allowed.includes(nuevoEstado)) {
    throw new Error(
      `Transición inválida: ${shipment.estado} → ${nuevoEstado}. Permitidos: ${allowed.join(", ") || "ninguno"}`
    );
  }

  // Mismo criterio que producción (orders.ts): no se despacha un pedido sin
  // pago confirmado, aunque el estado del Shipment lo permitiera.
  if (nuevoEstado === "Despachado" && shipment.order.estadoPago !== "Pagado") {
    throw new Error("No se puede despachar un pedido sin confirmar el pago primero");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.shipment.update({
      where: { id },
      data: { estado: nuevoEstado, ...data },
    });

    if (nuevoEstado === "Despachado" && shipment.order.estado === "ListoParaEnvio") {
      await tx.order.update({ where: { id: shipment.orderId }, data: { estado: "Enviado" } });
    }

    if (nuevoEstado === "Entregado") {
      await tx.order.update({
        where: { id: shipment.orderId },
        data: { estado: "Entregado" },
      });
    }

    return result;
  });

  if (nuevoEstado === "Despachado") {
    await sendEmail({
      to: shipment.order.customer.email,
      ...pedidoEnviadoTemplate({
        nombre: shipment.order.customer.nombre,
        numero: shipment.order.numero,
        transportista: shipment.transportista,
        trackingNumber: updated.trackingNumber,
      }),
    });
  }

  if (nuevoEstado === "Entregado") {
    await sendEmail({
      to: shipment.order.customer.email,
      ...pedidoEntregadoTemplate({ nombre: shipment.order.customer.nombre, numero: shipment.order.numero }),
    });
  }

  revalidatePath("/admin/envios");
  revalidatePath(`/admin/envios/${id}`);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${shipment.orderId}`);
  revalidatePath("/admin");
  return updated;
}

/**
 * Marca un envío como Devuelto y resuelve la devolución. Si es Reembolso,
 * revierte el monto del totalGastado del cliente (la transferencia real al
 * cliente la hace el dueño aparte — esto solo lleva la cuenta en el
 * sistema) y marca el pedido como Cancelado, igual que cualquier otra
 * cancelación. Si es Cambio, solo registra el motivo/notas sin tocar
 * montos — el pedido de reemplazo se crea a mano desde "Nuevo pedido".
 */
export async function marcarDevolucion(
  shipmentId: string,
  data: {
    motivo: string;
    resolucion: ResolucionDevolucion;
    montoReembolsado?: number;
    notas?: string;
  }
) {
  const session = await requireAdmin();
  const shipment = await prisma.shipment.findUnique({
    where: { id: shipmentId },
    include: { order: true },
  });
  if (!shipment) throw new Error("Envío no encontrado");

  const allowed = SHIPMENT_TRANSITIONS[shipment.estado] ?? [];
  if (!allowed.includes("Devuelto")) {
    throw new Error(`No se puede marcar como devuelto desde el estado ${shipment.estado}`);
  }
  if (!data.motivo.trim()) throw new Error("Indica el motivo de la devolución");
  if (data.resolucion === "Reembolso" && (!data.montoReembolsado || data.montoReembolsado <= 0)) {
    throw new Error("Indica el monto a reembolsar");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.shipment.update({
      where: { id: shipmentId },
      data: {
        estado: "Devuelto",
        devolucionMotivo: data.motivo,
        devolucionResolucion: data.resolucion,
        devolucionMontoReembolsado: data.resolucion === "Reembolso" ? data.montoReembolsado : null,
        devolucionNotas: data.notas,
        devolucionAt: new Date(),
      },
    });

    if (data.resolucion === "Reembolso" && data.montoReembolsado) {
      await tx.customer.update({
        where: { id: shipment.order.customerId },
        data: { totalGastado: { decrement: data.montoReembolsado } },
      });
    }

    await tx.order.update({ where: { id: shipment.orderId }, data: { estado: "Cancelado" } });

    return result;
  });

  await logAudit({
    userId: session.user.id,
    entidad: "Shipment",
    entidadId: shipmentId,
    accion: `devolucion:${data.resolucion}`,
    payload: { motivo: data.motivo, montoReembolsado: data.montoReembolsado ?? null },
  });

  revalidatePath("/admin/envios");
  revalidatePath(`/admin/envios/${shipmentId}`);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${shipment.orderId}`);
  revalidatePath("/admin/clientes");
  revalidatePath("/admin");
  return updated;
}
