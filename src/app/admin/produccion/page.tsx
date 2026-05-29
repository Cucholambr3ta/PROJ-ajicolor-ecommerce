import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const estados = ["Todos", "Solicitado", "EnProceso", "Recibido", "RechazadoParcial"];

export default async function ProduccionPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const lotes = await prisma.productionBatch.findMany({
    where: estado && estado !== "Todos" ? { estado } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cola de Producción</h1>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {estados.map((e) => (
          <Badge
            key={e}
            variant={estado === e || (!estado && e === "Todos") ? "default" : "outline"}
            className="cursor-pointer"
          >
            {e}
          </Badge>
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
                  <p className="font-medium">{l.proveedor}</p>
                  <p className="text-sm text-gray-500">
                    {l.variantes} — {l.unidadesPorVar} u/var
                  </p>
                  <p className="text-sm text-gray-400">
                    Estimado: {l.fechaEstimada.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${l.costoTotal.toFixed(2)}</p>
                  <Badge variant="outline">{l.estado}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
