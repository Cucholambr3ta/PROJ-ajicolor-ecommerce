import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import ClientesPageClient from "./ClientesPageClient";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;

  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { nombre: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [clientes, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: { _count: { select: { orders: true } } },
      orderBy: { fechaRegistro: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.customer.count({ where }),
  ]);

  const clientesSerializables = clientes.map((c) => ({ ...c, totalGastado: Number(c.totalGastado) }));
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <ClientesPageClient
      clientes={clientesSerializables}
      q={q ?? ""}
      page={page}
      totalPages={totalPages}
    />
  );
}
