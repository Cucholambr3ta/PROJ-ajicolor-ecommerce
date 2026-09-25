"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, requireCliente } from "@/lib/auth-guard";
import { logAudit } from "@/lib/audit";
import { sumarDiasHabiles } from "@/lib/actions/cart";
import { getStoreSettings } from "@/lib/actions/settings";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseOrThrow } from "@/lib/schemas";
import { sendEmail } from "@/lib/email/send";
import {
  comprobanteRecibidoTemplate,
  avisoComprobanteSubidoDuenoTemplate,
  pagoConfirmadoTemplate,
} from "@/lib/email/templates";

const reportPaymentSchema = z.object({
  orderId: z.string().min(1),
  monto: z.number().positive(),
  banco: z.string().trim().max(100).optional(),
  fechaTransferencia: z.date().optional(),
  referencia: z.string().trim().max(200).optional(),
  comprobanteUrl: z.string().trim().max(500).optional(),
});

/** El cliente informa que hizo la transferencia (con o sin comprobante todavía). */
export async function reportPayment(data: {
  orderId: string;
  monto: number;
  banco?: string;
  fechaTransferencia?: Date;
  referencia?: string;
  comprobanteUrl?: string;
}) {
  const customerId = await requireCliente();
  const parsed = parseOrThrow(reportPaymentSchema, data);

  const order = await prisma.order.findUnique({ where: { id: parsed.orderId }, include: { customer: true } });
  if (!order || order.customerId !== customerId) throw new Error("Pedido no encontrado");
  if (order.estadoPago === "Pagado") throw new Error("Este pedido ya fue pagado");

  const payment = await prisma.$transaction(async (tx) => {
    const created = await tx.payment.create({
      data: {
        orderId: parsed.orderId,
        monto: parsed.monto,
        banco: parsed.banco,
        fechaTransferencia: parsed.fechaTransferencia,
        referencia: parsed.referencia,
        comprobanteUrl: parsed.comprobanteUrl,
        estado: "EnRevision",
      },
    });
    await tx.order.update({ where: { id: order.id }, data: { estadoPago: "EnRevision" } });
    return created;
  });

  const settings = await getStoreSettings();
  await sendEmail({
    to: order.customer.email,
    ...comprobanteRecibidoTemplate({ nombre: order.customer.nombre, numero: order.numero }),
  });
  if (settings.emailContacto) {
    await sendEmail({
      to: settings.emailContacto,
      ...avisoComprobanteSubidoDuenoTemplate({ numero: order.numero, nombreCliente: order.customer.nombre }),
    });
  }

  revalidatePath(`/pedido/${order.numero}`);
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  return payment;
}

/** El admin confirma el pago: arranca el plazo de producción y suma el gasto del cliente. */
export async function confirmPayment(paymentId: string) {
  const session = await requireAdmin();
  const userId = session.user.id;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: { include: { customer: true } } },
  });
  if (!payment) throw new Error("Comprobante no encontrado");
  if (payment.order.estadoPago === "Pagado") throw new Error("Este pedido ya fue confirmado");

  const settings = await getStoreSettings();
  const ahora = new Date();
  const fechaCompromiso = sumarDiasHabiles(ahora, settings.plazoProduccionDias);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { estado: "Pagado", confirmadoPorId: userId, confirmadoAt: ahora },
    });

    const order = await tx.order.update({
      where: { id: payment.orderId },
      data: {
        estado: "Pagado",
        estadoPago: "Pagado",
        pagadoAt: ahora,
        fechaCompromiso,
      },
    });

    await tx.customer.update({
      where: { id: order.customerId },
      data: { totalGastado: { increment: order.total } },
    });

    return order;
  });

  await logAudit({
    userId,
    entidad: "Order",
    entidadId: updated.id,
    accion: "confirmar_pago",
    payload: { paymentId, monto: Number(payment.monto) },
  });

  await sendEmail({
    to: payment.order.customer.email,
    ...pagoConfirmadoTemplate({
      nombre: payment.order.customer.nombre,
      numero: updated.numero,
      fechaCompromiso: updated.fechaCompromiso,
    }),
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${updated.id}`);
  revalidatePath("/admin/produccion");
  revalidatePath("/admin");
  revalidatePath(`/pedido/${updated.numero}`);
  return updated;
}

export async function rejectPayment(paymentId: string, motivo?: string) {
  const session = await requireAdmin();
  const userId = session.user.id;

  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { order: true } });
  if (!payment) throw new Error("Comprobante no encontrado");

  const updated = await prisma.$transaction(async (tx) => {
    await tx.payment.update({ where: { id: paymentId }, data: { estado: "Rechazado" } });
    return tx.order.update({
      where: { id: payment.orderId },
      data: { estadoPago: "Rechazado" },
    });
  });

  await logAudit({
    userId,
    entidad: "Order",
    entidadId: updated.id,
    accion: "rechazar_pago",
    payload: { paymentId, motivo },
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${updated.id}`);
  revalidatePath(`/pedido/${updated.numero}`);
  return updated;
}

/** Pedidos pendientes de pago hace más de N días, para revisar/cancelar manualmente. */
export async function getPedidosVencidosSinPago(diasLimite = 3) {
  await requireAdmin();
  const limite = new Date();
  limite.setDate(limite.getDate() - diasLimite);

  return prisma.order.findMany({
    where: {
      estado: "Pendiente",
      estadoPago: { in: ["PendienteTransferencia", "EnRevision"] },
      createdAt: { lt: limite },
    },
    include: { customer: true },
    orderBy: { createdAt: "asc" },
  });
}
