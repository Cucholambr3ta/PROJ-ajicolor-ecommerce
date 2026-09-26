"use server";

import { authenticator } from "otplib";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

authenticator.options = { window: 1 };

async function requireCurrentUser() {
  const session = await requireAdmin();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error("Usuario no encontrado");
  return user;
}

export async function getTotpStatus() {
  const user = await requireCurrentUser();
  return { totpEnabled: user.totpEnabled };
}

export async function startTotpSetup() {
  const user = await requireCurrentUser();
  if (user.totpEnabled) {
    throw new Error("El 2FA ya está activo. Desactívalo antes de generar un nuevo código.");
  }

  const secret = authenticator.generateSecret();
  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret } });

  const otpauthUrl = authenticator.keyuri(user.email, "Ajicolor Admin", secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

  return { secret, qrCodeDataUrl };
}

export async function confirmTotpSetup(token: string) {
  const user = await requireCurrentUser();
  if (!user.totpSecret) throw new Error("No hay un setup de 2FA en curso");

  const valid = authenticator.verify({ token, secret: user.totpSecret });
  if (!valid) throw new Error("Código inválido");

  await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } });
}

export async function disableTotp(token: string) {
  const user = await requireCurrentUser();
  if (!user.totpEnabled || !user.totpSecret) {
    throw new Error("El 2FA no está activo");
  }

  const valid = authenticator.verify({ token, secret: user.totpSecret });
  if (!valid) throw new Error("Código inválido");

  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: false, totpSecret: null },
  });
}
