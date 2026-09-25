"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { z } from "zod";
import { emailSchema, parseOrThrow } from "@/lib/schemas";
import { type ActionResult, toActionResult } from "@/lib/action-result";

const subscribeSchema = z.object({ email: emailSchema });

export async function subscribeNewsletter(emailInput: string): Promise<ActionResult<void>> {
  return toActionResult(async () => {
    const { email } = parseOrThrow(subscribeSchema, { email: emailInput });
    await prisma.subscriber.upsert({
      where: { email },
      update: { activo: true },
      create: { email },
    });
  });
}

export async function getSubscribers() {
  await requireAdmin();
  return prisma.subscriber.findMany({ where: { activo: true }, orderBy: { createdAt: "desc" } });
}

export async function exportSubscribersCSV(): Promise<string> {
  await requireAdmin();
  const subs = await prisma.subscriber.findMany({ where: { activo: true }, orderBy: { createdAt: "desc" } });
  const header = "Email,Fecha de suscripción";
  const rows = subs.map((s) => `${s.email},${s.createdAt.toISOString()}`);
  return [header, ...rows].join("\n");
}
