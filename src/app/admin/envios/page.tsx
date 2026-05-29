import { prisma } from "@/lib/prisma";
import EnviosPageClient from "./EnviosPageClient";

export const dynamic = "force-dynamic";

export default async function EnviosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const envios = await prisma.shipment.findMany({
    where: estado && estado !== "Todos" ? { estado } : undefined,
    include: { order: { include: { customer: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <EnviosPageClient envios={envios} filtro={estado ?? "Todos"} />;
}
