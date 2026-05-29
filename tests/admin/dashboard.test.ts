import { Card } from "@/components/ui/card";
import { ShoppingCart, Package, AlertTriangle, Factory } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KPI {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

const kpis: KPI[] = [
  { label: "Ventas Hoy", value: "$0", icon: ShoppingCart, color: "text-ajicolor-magenta" },
  { label: "Pedidos Pendientes", value: "0", icon: Package, color: "text-ajicolor-purple" },
  { label: "Stock Bajo", value: "0", icon: AlertTriangle, color: "text-amber-500" },
  { label: "Producción Activa", value: "0", icon: Factory, color: "text-ajicolor-yellow" },
];

function validateKPIs(items: KPI[]): void {
  if (items.length !== 4) throw new Error("Dashboard must have exactly 4 KPIs");

  const requiredLabels = ["Ventas Hoy", "Pedidos Pendientes", "Stock Bajo", "Producción Activa"];
  for (const label of requiredLabels) {
    if (!items.find((k) => k.label === label)) {
      throw new Error(`Missing KPI: ${label}`);
    }
  }

  for (const kpi of items) {
    if (typeof kpi.value !== "string") throw new Error(`KPI ${kpi.label} value must be string`);
    if (typeof kpi.color !== "string") throw new Error(`KPI ${kpi.label} color must be string`);
    if (typeof kpi.icon !== "function") throw new Error(`KPI ${kpi.label} icon must be a component`);
  }
}

validateKPIs(kpis);

const dashboardStructure = {
  hasTitle: true,
  title: "Dashboard",
  kpiCount: kpis.length,
  gridCols: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
};

function validateDashboard(struct: typeof dashboardStructure): void {
  if (!struct.hasTitle) throw new Error("Dashboard must have a title");
  if (struct.title !== "Dashboard") throw new Error("Title must be 'Dashboard'");
  if (struct.kpiCount !== 4) throw new Error("Dashboard must render 4 KPI cards");
  if (!struct.gridCols.includes("lg:grid-cols-4")) throw new Error("Dashboard must be 4-col on large screens");
}

validateDashboard(dashboardStructure);
