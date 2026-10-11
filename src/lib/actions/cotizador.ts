"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { crearCotizacionSchema, parseOrThrow } from "@/lib/schemas";
import { type ActionResult, toActionResult } from "@/lib/action-result";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";

/** Prendas activas con sus colores y zonas de impresión, para el cotizador público (2D/3D). */
export async function getPrendasActivas() {
  return prisma.prendaBase.findMany({
    where: { activa: true },
    include: {
      colores: { orderBy: { nombre: "asc" } },
      zonas: true,
    },
    orderBy: { orden: "asc" },
  });
}

/** Sube el diseño del cliente al bucket público de diseños personalizados. */
export async function uploadDisenoCotizador(formData: FormData): Promise<ActionResult<string>> {
  return toActionResult(async () => {
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) throw new Error("Selecciona un archivo");
    if (!file.type.startsWith("image/")) throw new Error("El archivo debe ser una imagen");
    if (file.size > 10 * 1024 * 1024) throw new Error("La imagen no puede pesar más de 10MB");

    const { uploadDisenoPersonalizado } = await import("@/lib/storage");
    return uploadDisenoPersonalizado(file);
  });
}

/** Crea una solicitud de cotización personalizada — queda Pendiente hasta que el dueño la revise. */
export async function crearCotizacion(data: {
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto?: string;
  prendaBaseId: string;
  colorNombre: string;
  talla?: string;
  cantidad: number;
  disenoUrl: string;
  notas?: string;
}): Promise<ActionResult<{ id: string }>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(crearCotizacionSchema, data);

    const prenda = await prisma.prendaBase.findUnique({ where: { id: parsed.prendaBaseId } });
    if (!prenda || !prenda.activa) throw new Error("Esa prenda ya no está disponible");

    const colorValido = await prisma.prendaColor.findUnique({
      where: { prendaBaseId_nombre: { prendaBaseId: parsed.prendaBaseId, nombre: parsed.colorNombre } },
    });
    if (!colorValido) throw new Error("Ese color no está disponible para la prenda elegida");

    if (prenda.tallasDisponibles.length > 0 && !parsed.talla) {
      throw new Error("Selecciona una talla");
    }

    const session = await auth();
    const customerId = session?.user?.rol === "Cliente" ? session.user.id : undefined;

    const cotizacion = await prisma.cotizacionPersonalizada.create({
      data: { ...parsed, customerId },
    });

    const { getStoreSettings } = await import("@/lib/actions/settings");
    const settings = await getStoreSettings();
    if (settings.emailContacto) {
      await sendEmail({
        to: settings.emailContacto,
        subject: `Nueva cotización — ${prenda.nombre} × ${parsed.cantidad}`,
        html: `<p>Nueva solicitud de cotización de <strong>${parsed.nombreContacto}</strong> (${parsed.emailContacto}).</p>
               <p><strong>Prenda:</strong> ${prenda.nombre} — ${parsed.colorNombre}${parsed.talla ? ` — Talla ${parsed.talla}` : ""}</p>
               <p><strong>Cantidad:</strong> ${parsed.cantidad}</p>
               ${parsed.notas ? `<p><strong>Notas:</strong> ${parsed.notas}</p>` : ""}
               <p><a href="${parsed.disenoUrl}">Ver diseño adjunto</a></p>`,
      });
    }

    revalidatePath("/admin/cotizaciones");
    return { id: cotizacion.id };
  });
}

/** Todas las cotizaciones para el panel admin. */
export async function getCotizacionesAdmin() {
  await requireAdmin();
  return prisma.cotizacionPersonalizada.findMany({
    include: { prendaBase: true, customer: { select: { nombre: true, email: true } }, order: { select: { id: true, numero: true } } },
    orderBy: { createdAt: "desc" },
  });
}

/** Métricas del dashboard de cotizaciones: volumen y tasa de conversión a pedido real. */
export async function getCotizacionesMetrics() {
  await requireAdmin();

  const [total, porEstado, aceptadasConPedido] = await Promise.all([
    prisma.cotizacionPersonalizada.count(),
    prisma.cotizacionPersonalizada.groupBy({ by: ["estado"], _count: true }),
    prisma.cotizacionPersonalizada.count({ where: { estado: "Aceptada", order: { isNot: null } } }),
  ]);

  const aceptadas = porEstado.find((e) => e.estado === "Aceptada")?._count ?? 0;
  const tasaConversion = total > 0 ? Math.round((aceptadasConPedido / total) * 100) : 0;

  return {
    total,
    porEstado: Object.fromEntries(porEstado.map((e) => [e.estado, e._count])),
    aceptadas,
    convertidasAPedido: aceptadasConPedido,
    tasaConversion,
  };
}

export async function actualizarCotizacion(
  id: string,
  data: { estado?: "Pendiente" | "EnRevision" | "Cotizada" | "Aceptada" | "Rechazada"; precioCotizado?: number }
) {
  await requireAdmin();
  const cotizacion = await prisma.cotizacionPersonalizada.update({ where: { id }, data });
  revalidatePath("/admin/cotizaciones");
  return cotizacion;
}

/**
 * Convierte una cotización ya Aceptada (con precio fijado) en un pedido
 * real. El ítem queda "libre" (sin ProductVariant de catálogo) porque la
 * prenda es a medida — ver OrderItem.descripcionLibre/colorLibre/etc.
 * Requiere que el cliente de la cotización tenga cuenta (customerId), ya
 * que Order.customerId es obligatorio; si la cotización vino de un
 * contacto sin cuenta, falla con un mensaje claro para que el admin cree
 * primero el cliente.
 */
export async function convertirCotizacionAPedido(cotizacionId: string): Promise<ActionResult<{ orderId: string; numero: number }>> {
  return toActionResult(async () => {
    await requireAdmin();

    const cotizacion = await prisma.cotizacionPersonalizada.findUnique({
      where: { id: cotizacionId },
      include: { prendaBase: true, order: true },
    });
    if (!cotizacion) throw new Error("Cotización no encontrada");
    if (cotizacion.order) throw new Error("Esta cotización ya tiene un pedido generado");
    if (cotizacion.estado !== "Aceptada") throw new Error("Solo se puede convertir una cotización Aceptada");
    if (!cotizacion.precioCotizado) throw new Error("Falta fijar el precio cotizado antes de convertir");
    if (!cotizacion.customerId) {
      throw new Error("Este contacto no tiene cuenta de cliente — crea el cliente primero en Clientes");
    }

    const precioUnit = Number(cotizacion.precioCotizado);
    const subtotal = precioUnit; // precioCotizado ya es el total por la cantidad pedida

    const order = await prisma.order.create({
      data: {
        customerId: cotizacion.customerId,
        canal: "Web",
        cotizacionId: cotizacion.id,
        subtotal,
        total: subtotal,
        notas: `Generado desde cotización personalizada — ${cotizacion.prendaBase.nombre} × ${cotizacion.cantidad}`,
        items: {
          create: {
            cantidad: cotizacion.cantidad,
            precioUnit: precioUnit / cotizacion.cantidad,
            descripcionLibre: cotizacion.prendaBase.nombre,
            colorLibre: cotizacion.colorNombre,
            tallaLibre: cotizacion.talla,
            disenoUrlLibre: cotizacion.disenoUrl,
          },
        },
      },
      include: { customer: true },
    });

    const { getStoreSettings } = await import("@/lib/actions/settings");
    const { pedidoRecibidoTemplate } = await import("@/lib/email/templates");
    const settings = await getStoreSettings();
    await sendEmail({
      to: order.customer.email,
      ...pedidoRecibidoTemplate({
        nombre: order.customer.nombre,
        numero: order.numero,
        items: [
          {
            nombre: cotizacion.prendaBase.nombre,
            talle: cotizacion.talla,
            color: cotizacion.colorNombre,
            cantidad: cotizacion.cantidad,
            precioUnit: precioUnit / cotizacion.cantidad,
          },
        ],
        total: subtotal,
        datosBancarios: {
          titular: settings.bancoTitular,
          rut: settings.bancoRut,
          banco: settings.bancoNombre,
          tipoCuenta: settings.bancoTipoCuenta,
          numeroCuenta: settings.bancoNumeroCuenta,
          email: settings.bancoEmail,
        },
      }),
    });

    revalidatePath("/admin/cotizaciones");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin");
    return { orderId: order.id, numero: order.numero };
  });
}
