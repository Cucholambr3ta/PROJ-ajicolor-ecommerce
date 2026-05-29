import { prisma } from "@/lib/prisma";
import ClientesPageClient from "./ClientesPageClient";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.customer.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { fechaRegistro: "desc" },
  });

  return <ClientesPageClient clientes={clientes} />;
}
