import { prisma } from "@/lib/prisma";
import { EstadoPedido, Prisma } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatCLP } from "@/lib/format";

export const dynamic = "force-dynamic";

const estados = ["Todos", "Pendiente", "Pagado", "EnProduccion", "ListoParaEnvio", "Enviado", "Entregado", "Cancelado"];
const PER_PAGE = 20;

function esEstadoPedido(value: string): value is EstadoPedido {
  return (Object.values(EstadoPedido) as string[]).includes(value);
}

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; q?: string; vencidos?: string; page?: string }>;
}) {
  const { estado, q, vencidos, page: pageParam } = await searchParams;
  const estadoValido = estado && esEstadoPedido(estado) ? estado : undefined;
  const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;
  const numeroBuscado = q ? parseInt(q.replace(/\D/g, ""), 10) : NaN;

  const where: Prisma.OrderWhereInput = {
    ...(estadoValido ? { estado: estadoValido } : {}),
    ...(q
      ? {
          OR: [
            ...(Number.isNaN(numeroBuscado) ? [] : [{ numero: numeroBuscado }]),
            { customer: { nombre: { contains: q, mode: "insensitive" as const } } },
            { customer: { email: { contains: q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(vencidos === "1"
      ? {
          estado: "Pendiente",
          estadoPago: { in: ["PendienteTransferencia", "EnRevision"] },
          createdAt: { lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        }
      : {}),
  };

  const [pedidos, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: true,
        items: { include: { variant: { include: { product: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  function buildHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { estado, q, vencidos, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return qs ? `/admin/pedidos?${qs}` : "/admin/pedidos";
  }

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

      <form action="/admin/pedidos" className="flex gap-2 mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por número, cliente o email..."
          className="flex-1 border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900"
        />
        <button type="submit" className="px-4 py-2 rounded-md border border-gray-300 dark:border-neutral-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800">
          Buscar
        </button>
      </form>

      <div className="flex gap-2 mb-4 flex-wrap items-center">
        {estados.map((e) => (
          <Link key={e} href={buildHref({ estado: e === "Todos" ? undefined : e, page: undefined })}>
            <Badge
              variant={estado === e || (!estado && e === "Todos") ? "default" : "outline"}
              className="cursor-pointer"
            >
              {e}
            </Badge>
          </Link>
        ))}
        <Link href={buildHref({ vencidos: vencidos === "1" ? undefined : "1", page: undefined })}>
          <Badge variant={vencidos === "1" ? "destructive" : "outline"} className="cursor-pointer">
            Vencidos sin pago
          </Badge>
        </Link>
      </div>

      <Card>
        {pedidos.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-neutral-400">No hay pedidos para mostrar.</div>
        ) : (
          <div className="divide-y dark:divide-neutral-700">
            {pedidos.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium dark:text-neutral-100">
                    #{String(p.numero).padStart(4, "0")} — {p.customer.nombre}
                  </p>
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-6">
          <Link
            href={buildHref({ page: String(Math.max(1, page - 1)) })}
            aria-disabled={page <= 1}
            className={`px-4 py-2 text-xs font-bold uppercase border rounded-md ${page <= 1 ? "pointer-events-none opacity-30" : "hover:bg-gray-50 dark:hover:bg-neutral-800"}`}
          >
            Anterior
          </Link>
          <span className="text-sm px-3">
            Página {page} de {totalPages}
          </span>
          <Link
            href={buildHref({ page: String(Math.min(totalPages, page + 1)) })}
            aria-disabled={page >= totalPages}
            className={`px-4 py-2 text-xs font-bold uppercase border rounded-md ${page >= totalPages ? "pointer-events-none opacity-30" : "hover:bg-gray-50 dark:hover:bg-neutral-800"}`}
          >
            Siguiente
          </Link>
        </div>
      )}
    </div>
  );
}
