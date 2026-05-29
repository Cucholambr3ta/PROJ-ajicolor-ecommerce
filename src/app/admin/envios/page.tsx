import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const estados = ["Todos", "Preparando", "Despachado", "EnTransito", "Entregado", "Devuelto"];

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Envíos</h1>
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
        {envios.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay envíos para mostrar.</div>
        ) : (
          <div className="divide-y">
            {envios.map((env) => (
              <div key={env.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{env.order.customer.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {env.transportista ?? "Sin transportista"}
                    {env.trackingNumber ? ` — ${env.trackingNumber}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {env.fechaDespacho
                      ? `Despacho: ${env.fechaDespacho.toLocaleDateString()}`
                      : "Pendiente"}
                  </p>
                  <Badge variant="outline">{env.estado}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
