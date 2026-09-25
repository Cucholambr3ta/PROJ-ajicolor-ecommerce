"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

const DEFAULTS = {
  id: "default" as const,
  costoEnvioCorreos: 3000,
  plazoProduccionDias: 7,
};

/** Configuración de la tienda. Público (contacto/footer/checkout la leen sin sesión). */
export async function getStoreSettings() {
  const settings = await prisma.storeSettings.findUnique({ where: { id: "default" } });
  if (settings) return settings;
  return prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: DEFAULTS,
  });
}

export async function updateStoreSettings(data: {
  razonSocial?: string;
  rut?: string;
  direccionLegal?: string;
  emailContacto?: string;
  telefonoContacto?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  horarioAtencion?: string;
  bancoTitular?: string;
  bancoRut?: string;
  bancoNombre?: string;
  bancoTipoCuenta?: string;
  bancoNumeroCuenta?: string;
  bancoEmail?: string;
  costoEnvioCorreos?: number;
  plazoProduccionDias?: number;
}) {
  await requireAdmin();
  const updated = await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: data,
    create: { ...DEFAULTS, ...data },
  });
  revalidatePath("/admin/configuracion");
  revalidatePath("/contacto");
  revalidatePath("/terminos");
  revalidatePath("/pedido", "layout");
  return updated;
}
