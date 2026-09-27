"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { crearCotizacionSchema, parseOrThrow } from "@/lib/schemas";
import { type ActionResult, toActionResult } from "@/lib/action-result";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email/send";

/** Prendas activas con sus colores, para el selector del cotizador público. */
export async function getPrendasActivas() {
  return prisma.prendaBase.findMany({
    where: { activa: true },
    include: { colores: { orderBy: { nombre: "asc" } } },
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
    include: { prendaBase: true, customer: { select: { nombre: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
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
