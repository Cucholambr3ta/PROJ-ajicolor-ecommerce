"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Truck,
  Users,
  Layers,
  Factory,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/produccion", label: "Producción", icon: Package },
  { href: "/admin/proveedores", label: "Proveedores", icon: Factory },
  { href: "/admin/stock", label: "Stock", icon: Warehouse },
  { href: "/admin/envios", label: "Envíos", icon: Truck },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/catalogo", label: "Catálogo", icon: Layers },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-ajicolor-magenta border-r-4 border-ajicolor-ink flex flex-col p-5">
      <div className="mb-10">
        <h1 className="text-3xl font-black italic toon-script text-white flex items-center gap-2">
          <span className="bg-black p-1.5 thick-border text-lg not-italic">A</span> Admin
        </h1>
      </div>
      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 font-black uppercase text-xs transition-colors ${
                isActive
                  ? "bg-black text-white thick-border rotate-1"
                  : "text-white hover:bg-white hover:text-ajicolor-ink"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="pt-4 mt-4 border-t-2 border-white/30">
        <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Ajicolor Admin v0.1.0</p>
      </div>
    </aside>
  );
}
