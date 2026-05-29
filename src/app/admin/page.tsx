import { Card } from "@/components/ui/card";
import { Package, ShoppingCart, AlertTriangle, Factory } from "lucide-react";

const kpis = [
  { label: "Ventas Hoy", value: "$0", icon: ShoppingCart, color: "text-ajicolor-magenta" },
  { label: "Pedidos Pendientes", value: "0", icon: Package, color: "text-ajicolor-purple" },
  { label: "Stock Bajo", value: "0", icon: AlertTriangle, color: "text-amber-500" },
  { label: "Producción Activa", value: "0", icon: Factory, color: "text-ajicolor-yellow" },
];

export default function AdminDashboard() {
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
