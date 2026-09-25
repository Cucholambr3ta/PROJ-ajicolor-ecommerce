"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
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
  ShieldCheck,
  Settings,
  Sparkles,
  Ticket,
  Star,
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
  { href: "/admin/colecciones", label: "Colecciones", icon: Sparkles },
  { href: "/admin/cupones", label: "Cupones", icon: Ticket },
  { href: "/admin/resenas", label: "Reseñas", icon: Star },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
  { href: "/admin/seguridad", label: "Seguridad", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-white dark:bg-neutral-900 border-r-2 border-ajicolor-ink flex flex-col p-5">
      <div className="mb-8">
        <Logo className="h-12 w-auto" />
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded font-semibold text-sm transition-colors ${
                isActive
                  ? "bg-ajicolor-magenta text-white"
                  : "text-ajicolor-ink hover:bg-gray-100 dark:hover:bg-neutral-800"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-neutral-700 flex items-center justify-between gap-3">
        <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-semibold uppercase tracking-widest">Ajicolor Admin v0.1.0</p>
        <ThemeToggle />
      </div>
    </aside>
  );
}
