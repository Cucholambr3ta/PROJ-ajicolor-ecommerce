"use server";

import { authenticator } from "otplib";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("No autenticado");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuario no encontrado");
  return user;
}

export async function getTotpStatus() {
  const user = await requireCurrentUser();
  return { totpEnabled: user.totpEnabled };
}

export async function startTotpSetup() {
  const user = await requireCurrentUser();
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

export async function disableTotp() {
  const user = await requireCurrentUser();
  await prisma.user.update({
    where: { id: user.id },
    data: { totpEnabled: false, totpSecret: null },
  });
}
