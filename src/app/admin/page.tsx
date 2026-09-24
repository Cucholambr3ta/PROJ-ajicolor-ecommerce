import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { getVentasUltimos30Dias } from "@/lib/actions/metrics";
import VentasChart from "./VentasChart";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [ventasMes, pedidosPendientes, variantesStockBajo, produccionActiva, ventas30d] = await Promise.all([
    prisma.order.aggregate({
      where: {
        createdAt: { gte: firstDayOfMonth },
        estado: "Entregado",
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: { estado: "Pendiente" },
    }),
    prisma.productVariant.findMany({ select: { stock: true, stockMin: true } }),
    prisma.productionBatch.count({
      where: { estado: "En Progreso" },
    }),
    getVentasUltimos30Dias(),
  ]);

  const stockBajo = variantesStockBajo.filter((v) => v.stock <= v.stockMin).length;

  const kpis = [
    { label: "Ventas del mes", value: `$${ventasMes._sum.total?.toFixed(0) ?? "0"}`, bg: "bg-ajicolor-yellow" },
    { label: "Pedidos pendientes", value: String(pedidosPendientes), bg: "bg-white" },
    { label: "Stock bajo", value: String(stockBajo), bg: "bg-white" },
    { label: "Producción activa", value: String(produccionActiva), bg: "bg-ajicolor-purple text-white" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black">Centro de Comandos</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className={`${kpi.bg} thick-border pop-shadow p-6`}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2 opacity-70">{kpi.label}</p>
            <h3 className="text-3xl font-black">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <Card className="p-6">
        <h2 className="font-extrabold mb-4">Ritmo de ventas (últimos 30 días)</h2>
        <VentasChart data={ventas30d} />
      </Card>
    </div>
  );
}
