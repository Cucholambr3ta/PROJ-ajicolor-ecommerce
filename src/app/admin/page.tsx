import { prisma } from "@/lib/prisma";
import { Package, ShoppingCart, AlertTriangle, Factory } from "lucide-react";
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
    {
      label: "Ventas del Mes",
      value: `$${ventasMes._sum.total?.toFixed(2) ?? "0.00"}`,
      icon: ShoppingCart,
      bg: "bg-ajicolor-yellow",
      shadow: "magenta-shadow",
    },
    {
      label: "Pedidos Pendientes",
      value: String(pedidosPendientes),
      icon: Package,
      bg: "bg-white",
      shadow: "pop-shadow",
    },
    {
      label: "Stock Bajo",
      value: String(stockBajo),
      icon: AlertTriangle,
      bg: "bg-white",
      shadow: "pop-shadow",
    },
    {
      label: "Producción Activa",
      value: String(produccionActiva),
      icon: Factory,
      bg: "bg-ajicolor-purple text-white",
      shadow: "",
      customShadow: "shadow-[10px_10px_0px_var(--yellow)]",
    },
  ];

  return (
    <div>
      <header className="flex justify-between items-center mb-16 border-b-8 border-ajicolor-ink pb-6">
        <div>
          <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">Command Center</h1>
          <p className="text-lg font-bold opacity-30">Vigilando el ritmo de ventas.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className={`${kpi.bg} thick-border p-8 ${kpi.shadow} ${kpi.customShadow ?? ""}`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest">{kpi.label}</p>
              <kpi.icon className="h-6 w-6 opacity-60" />
            </div>
            <h3 className="text-4xl font-black">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <Card className="p-6 mt-6">
        <h2 className="font-semibold text-gray-700 mb-4">Ventas — últimos 30 días</h2>
        <VentasChart data={ventas30d} />
      </Card>
    </div>
  );
}
