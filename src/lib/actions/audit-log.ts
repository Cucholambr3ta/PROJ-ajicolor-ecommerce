"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

const PER_PAGE = 50;

export async function getAuditLog(page = 1) {
  await requireAdmin();
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.auditLog.count(),
  ]);
  return { items, total, page, totalPages: Math.max(1, Math.ceil(total / PER_PAGE)) };
}
