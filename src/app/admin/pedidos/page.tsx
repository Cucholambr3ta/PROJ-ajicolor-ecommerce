import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const estados = ["Todos", "Pendiente", "Confirmado", "EnProduccion", "Enviado", "Entregado", "Cancelado"];

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const pedidos = await prisma.order.findMany({
    where: estado && estado !== "Todos" ? { estado } : undefined,
    include: {
      customer: true,
      items: { include: { variant: { include: { product: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
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
        {pedidos.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay pedidos para mostrar.</div>
        ) : (
          <div className="divide-y">
            {pedidos.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.customer.nombre}</p>
                  <p className="text-sm text-gray-500">
                    {p.items.length} item(s) — {p.canal}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-bold">${p.total.toFixed(2)}</p>
                    <Badge variant="outline">{p.estado}</Badge>
                  </div>
                  <Link
                    href={`/admin/pedidos/${p.id}`}
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
