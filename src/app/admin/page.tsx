import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Package, ShoppingCart, AlertTriangle, Factory } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [ventasHoy, pedidosPendientes, stockBajo, produccionActiva] = await Promise.all([
    prisma.order.aggregate({
      where: { createdAt: { gte: today }, estado: { not: "Cancelado" } },
      _sum: { total: true },
    }),
    prisma.order.count({ where: { estado: { in: ["Pendiente", "Confirmado"] } } }),
    (await prisma.productVariant.findMany()).filter((v) => v.stock <= v.stockMin),
    prisma.productionBatch.count({ where: { estado: { in: ["Solicitado", "EnProceso"] } } }),
  ]);

  const kpis = [
    { label: "Ventas Hoy", value: `$${ventasHoy._sum.total?.toFixed(0) ?? "0"}`, icon: ShoppingCart, color: "text-ajicolor-magenta" },
    { label: "Pedidos Pendientes", value: String(pedidosPendientes), icon: Package, color: "text-ajicolor-purple" },
    { label: "Stock Bajo", value: String(stockBajo.length), icon: AlertTriangle, color: "text-amber-500" },
    { label: "Producción Activa", value: String(produccionActiva), icon: Factory, color: "text-ajicolor-yellow" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
              <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
