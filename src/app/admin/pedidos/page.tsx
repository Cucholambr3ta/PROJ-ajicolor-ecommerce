import { prisma } from "@/lib/prisma";
import { EstadoPedido } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCLP } from "@/lib/format";

export const dynamic = "force-dynamic";

const estados = ["Todos", "Pendiente", "Pagado", "EnProduccion", "ListoParaEnvio", "Enviado", "Entregado", "Cancelado"];

function esEstadoPedido(value: string): value is EstadoPedido {
  return (Object.values(EstadoPedido) as string[]).includes(value);
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;
  const estadoValido = estado && esEstadoPedido(estado) ? estado : undefined;
  const pedidos = await prisma.order.findMany({
    where: estadoValido ? { estado: estadoValido } : undefined,
    include: {
      customer: true,
      items: { include: { variant: { include: { product: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black dark:text-neutral-100">Pedidos</h1>
        <Link
          href="/admin/pedidos/nuevo"
          className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Nuevo pedido
        </Link>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {estados.map((e) => (
          <Link key={e} href={e === "Todos" ? "/admin/pedidos" : `/admin/pedidos?estado=${e}`}>
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
        {pedidos.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-neutral-400">No hay pedidos para mostrar.</div>
        ) : (
          <div className="divide-y dark:divide-neutral-700">
            {pedidos.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-neutral-100">{p.customer.nombre}</p>
                  <p className="text-sm text-gray-500 dark:text-neutral-400">
                    {p.items.length} item(s) — {p.canal}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="font-bold dark:text-neutral-100">{formatCLP(Number(p.total))}</p>
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
