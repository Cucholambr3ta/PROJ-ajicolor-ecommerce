import { prisma } from "@/lib/prisma";
import { EstadoEnvio } from "@prisma/client";
import EnviosPageClient from "./EnviosPageClient";

export const dynamic = "force-dynamic";

function esEstadoEnvio(value: string): value is EstadoEnvio {
  return (Object.values(EstadoEnvio) as string[]).includes(value);
}

export default async function EnviosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const estadoValido = estado && esEstadoEnvio(estado) ? estado : undefined;
  const envios = await prisma.shipment.findMany({
    where: estadoValido ? { estado: estadoValido } : undefined,
    include: { order: { include: { customer: true } } },
    orderBy: { createdAt: "desc" },
  });

  return <EnviosPageClient envios={envios} filtro={estado ?? "Todos"} />;
}
