import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getVentasUltimos30Dias } from "@/lib/actions/metrics";
import { formatCLP, formatFechaCorta } from "@/lib/format";
import Link from "next/link";
import VentasChart from "./VentasChart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    ventasMes,
    pagosPorRevisar,
    variantesStockBajo,
    produccionActiva,
    ventas30d,
    pedidosAtrasados,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { pagadoAt: { gte: firstDayOfMonth } },
      _sum: { total: true },
    }),
    prisma.payment.count({ where: { estado: "EnRevision" } }),
    prisma.productVariant.findMany({ select: { stock: true, stockMin: true } }),
    prisma.productionBatch.count({
      where: { estado: "EnProgreso" },
    }),
    getVentasUltimos30Dias(),
    prisma.order.findMany({
      where: {
        estado: { in: ["EnProduccion", "Pagado"] },
        fechaCompromiso: { lt: now },
      },
      include: { customer: true },
      orderBy: { fechaCompromiso: "asc" },
      take: 5,
    }),
  ]);

  const stockBajo = variantesStockBajo.filter((v) => v.stock <= v.stockMin).length;

  const kpis = [
    { label: "Ventas del mes (pagadas)", value: formatCLP(Number(ventasMes._sum.total ?? 0)), bg: "bg-ajicolor-yellow" },
    { label: "Pagos por revisar", value: String(pagosPorRevisar), bg: pagosPorRevisar > 0 ? "bg-ajicolor-magenta text-white" : "bg-white dark:bg-neutral-900" },
    { label: "En producción", value: String(produccionActiva), bg: "bg-ajicolor-purple text-white" },
    { label: "Piezas ya impresas (stock)", value: String(stockBajo), bg: "bg-white dark:bg-neutral-900" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black dark:text-neutral-100">Centro de Comandos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} thick-border pop-shadow p-6`}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2 opacity-70">{kpi.label}</p>
            <h3 className="text-3xl font-black">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {pedidosAtrasados.length > 0 && (
        <Card className="p-6 mb-8 border-2 border-ajicolor-magenta">
          <h2 className="font-extrabold mb-4 text-ajicolor-magenta">Pedidos atrasados de producción</h2>
          <div className="space-y-2">
            {pedidosAtrasados.map((order) => (
              <Link
                key={order.id}
                href={`/admin/pedidos/${order.id}`}
                className="flex items-center justify-between text-sm py-2 border-b last:border-0 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 -mx-2 px-2 rounded"
              >
                <span>
                  #{String(order.numero).padStart(4, "0")} — {order.customer.nombre}
                </span>
                <Badge variant="destructive">
                  Compromiso: {order.fechaCompromiso ? formatFechaCorta(order.fechaCompromiso) : "—"}
                </Badge>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {pagosPorRevisar > 0 && (
        <Card className="p-6 mb-8 border-2 border-ajicolor-yellow">
          <h2 className="font-extrabold mb-2">
            Tenés {pagosPorRevisar} comprobante{pagosPorRevisar === 1 ? "" : "s"} de pago sin revisar
          </h2>
          <Link href="/admin/pedidos" className="text-sm text-ajicolor-magenta hover:underline">
            Ir a pedidos →
          </Link>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="font-extrabold mb-4">Ritmo de ventas (últimos 30 días)</h2>
        <VentasChart data={ventas30d} />
      </Card>
    </div>
  );
}
