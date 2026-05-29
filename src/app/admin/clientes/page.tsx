import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = await prisma.customer.findMany({
    include: { _count: { select: { orders: true } } },
    orderBy: { fechaRegistro: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
      </div>
      <Card>
        {clientes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay clientes para mostrar.</div>
        ) : (
          <div className="divide-y">
            {clientes.map((c) => (
              <div key={c.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.nombre}</p>
                  <p className="text-sm text-gray-500">{c.email}</p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <div>
                    <p className="text-sm text-gray-500">{c._count.orders} pedido(s)</p>
                    <p className="font-bold">${c.totalGastado.toFixed(2)}</p>
                  </div>
                  {c.backstagePass && <Badge>Backstage</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
