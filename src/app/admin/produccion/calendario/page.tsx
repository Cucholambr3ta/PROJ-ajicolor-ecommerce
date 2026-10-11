import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CalendarioPageClient from "./CalendarioPageClient";

export const dynamic = "force-dynamic";

export default async function CalendarioProduccionPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const { mes } = await searchParams;
  const now = new Date();
  const [anioParam, mesParam] = mes ? mes.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const anio = anioParam ?? now.getFullYear();
  const mesIdx = (mesParam ?? now.getMonth() + 1) - 1;

  const inicioMes = new Date(anio, mesIdx, 1);
  const finMes = new Date(anio, mesIdx + 1, 0, 23, 59, 59);

  const [lotes, pedidos] = await Promise.all([
    prisma.productionBatch.findMany({
      where: {
        estado: { in: ["Solicitado", "EnProgreso"] },
        fechaEstimada: { gte: inicioMes, lte: finMes },
      },
      include: { supplier: true, items: { include: { variant: { include: { product: true } } } } },
      orderBy: { fechaEstimada: "asc" },
    }),
    prisma.order.findMany({
      where: {
        estado: { in: ["Pagado", "EnProduccion", "ListoParaEnvio"] },
        fechaCompromiso: { gte: inicioMes, lte: finMes },
      },
      include: { customer: true },
      orderBy: { fechaCompromiso: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black dark:text-neutral-100">Calendario de producción</h1>
        <Link href="/admin/produccion" className="text-sm text-gray-500 dark:text-neutral-400 hover:underline">
          Ver cola de producción →
        </Link>
      </div>

      <CalendarioPageClient
        anio={anio}
        mes={mesIdx}
        lotes={lotes.map((l) => ({
          id: l.id,
          dia: l.fechaEstimada.getDate(),
          supplier: l.supplier.nombre,
          unidades: l.items.reduce((acc, i) => acc + i.cantidad, 0),
          estado: l.estado,
        }))}
        pedidos={pedidos
          .filter((p) => p.fechaCompromiso)
          .map((p) => ({
            id: p.id,
            numero: p.numero,
            dia: p.fechaCompromiso!.getDate(),
            cliente: p.customer.nombre,
            estado: p.estado,
          }))}
      />
    </div>
  );
}
