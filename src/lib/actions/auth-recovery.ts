"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { randomBytes, createHash } from "crypto";
import { z } from "zod";
import { emailSchema, parseOrThrow } from "@/lib/schemas";
import { type ActionResult, toActionResult } from "@/lib/action-result";
import { sendEmail } from "@/lib/email/send";
import { verifyEmailTemplate, resetPasswordTemplate } from "@/lib/email/templates";

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Genera un token de un solo uso y guarda solo su hash (nunca el token en claro). */
async function createEmailToken(customerId: string, tipo: "verify" | "reset", ttlMs: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await prisma.emailToken.create({
    data: {
      customerId,
      tokenHash: hashToken(token),
      tipo,
      expiraAt: new Date(Date.now() + ttlMs),
    },
  });
  return token;
}

export async function sendVerificationEmail(customerId: string): Promise<void> {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer || customer.emailVerified) return;

  const token = await createEmailToken(customerId, "verify", VERIFY_TOKEN_TTL_MS);
  await sendEmail({ to: customer.email, ...verifyEmailTemplate({ nombre: customer.nombre, token }) });
}

export async function verifyEmail(token: string): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    const emailToken = await prisma.emailToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!emailToken || emailToken.tipo !== "verify" || emailToken.usadoAt || emailToken.expiraAt < new Date()) {
      throw new Error("El enlace de verificación no es válido o expiró");
    }

    await prisma.$transaction([
      prisma.customer.update({ where: { id: emailToken.customerId }, data: { emailVerified: new Date() } }),
      prisma.emailToken.update({ where: { id: emailToken.id }, data: { usadoAt: new Date() } }),
    ]);
  });
}

const requestResetSchema = z.object({ email: emailSchema });

/**
 * Siempre responde ok — nunca revela si un email existe en el sistema
 * (evita enumeración de cuentas). El correo solo se envía si existe.
 */
export async function requestPasswordReset(emailInput: string): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    const { email } = parseOrThrow(requestResetSchema, { email: emailInput });
    const customer = await prisma.customer.findUnique({ where: { email } });

    if (customer?.passwordHash) {
      const token = await createEmailToken(customer.id, "reset", RESET_TOKEN_TTL_MS);
      await sendEmail({ to: customer.email, ...resetPasswordTemplate({ nombre: customer.nombre, token }) });
    }
  });
}

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  passwordNueva: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(200),
});

export async function resetPassword(data: { token: string; passwordNueva: string }): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    const parsed = parseOrThrow(resetPasswordSchema, data);
    const emailToken = await prisma.emailToken.findUnique({ where: { tokenHash: hashToken(parsed.token) } });
    if (!emailToken || emailToken.tipo !== "reset" || emailToken.usadoAt || emailToken.expiraAt < new Date()) {
      throw new Error("El enlace de recuperación no es válido o expiró");
    }

    const passwordHash = await hash(parsed.passwordNueva, 12);
    await prisma.$transaction([
      prisma.customer.update({ where: { id: emailToken.customerId }, data: { passwordHash } }),
      prisma.emailToken.update({ where: { id: emailToken.id }, data: { usadoAt: new Date() } }),
    ]);
  });
}
