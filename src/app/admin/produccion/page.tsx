import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const estados = ["Todos", "Solicitado", "EnProgreso", "Completado", "Recibido"];

export default async function ProduccionPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const lotes = await prisma.productionBatch.findMany({
    where: estado && estado !== "Todos" ? { estado } : undefined,
    include: { supplier: true, items: { include: { variant: { include: { product: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Cola de Producción</h1>
        <Link
          href="/admin/produccion/nuevo"
          className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Nuevo lote
        </Link>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {estados.map((e) => (
          <Link key={e} href={e === "Todos" ? "/admin/produccion" : `/admin/produccion?estado=${e}`}>
            <Badge
              variant={estado === e || (!estado && e === "Todos") ? "default" : "outline"}
              className="cursor-pointer"
            >
              {e}
            </Badge>
          </Link>
        ))}
      </div>
      <Card>
        {lotes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay lotes de producción para mostrar.</div>
        ) : (
          <div className="divide-y">
            {lotes.map((l) => (
              <div key={l.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{l.supplier.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {l.items.length} variante{l.items.length === 1 ? "" : "s"} —{" "}
                    {l.items.reduce((acc, i) => acc + i.cantidad, 0)} u totales
                  </p>
                  <p className="text-sm text-gray-400">
                    Estimado: {l.fechaEstimada.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-bold">${l.costoTotal.toFixed(2)}</p>
                    <Badge variant="outline">{l.estado}</Badge>
                  </div>
                  <Link
                    href={`/admin/produccion/${l.id}`}
                    className="px-3 py-1.5 rounded-md bg-ajicolor-magenta text-white text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    Ver detalle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
