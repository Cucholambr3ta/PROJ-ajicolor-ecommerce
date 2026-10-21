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
  Boxes,
  History,
  Palette,
  PaintBucket,
  GalleryHorizontal,
  Tag,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/cotizaciones", label: "Cotizaciones", icon: Palette },
  { href: "/admin/produccion", label: "Producción", icon: Package },
  { href: "/admin/proveedores", label: "Proveedores", icon: Factory },
  { href: "/admin/insumos", label: "Insumos", icon: Boxes },
  { href: "/admin/stock", label: "Stock", icon: Warehouse },
  { href: "/admin/envios", label: "Envíos", icon: Truck },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/catalogo", label: "Catálogo", icon: Layers },
  { href: "/admin/colores", label: "Colores", icon: PaintBucket },
  { href: "/admin/precios", label: "Precios", icon: Tag },
  { href: "/admin/banners", label: "Banners", icon: GalleryHorizontal },
  { href: "/admin/colecciones", label: "Colecciones", icon: Sparkles },
  { href: "/admin/cupones", label: "Cupones", icon: Ticket },
  { href: "/admin/resenas", label: "Reseñas", icon: Star },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/admin/auditoria", label: "Auditoría", icon: History },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
  { href: "/admin/seguridad", label: "Seguridad", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative w-60 bg-[url('/fondo/fondo-claro.png')] bg-repeat [background-size:520px] [background-attachment:fixed] dark:bg-[url('/fondo/fondo-oscuro.png')] dark:bg-repeat dark:[background-size:520px] dark:[background-attachment:fixed] border-r-2 border-ajicolor-ink flex flex-col">
      {/* Capa glass: separada del fondo estampado para poder aplicar blur +
          semitransparencia sin perder el patrón detrás (backdrop-filter no
          se puede combinar limpiamente con background-image en el mismo
          elemento). */}
      <div className="absolute inset-0 bg-white/70 dark:bg-[var(--bg-light)]/70 backdrop-blur-md" />

      <div className="relative flex flex-col flex-1 p-5">
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
                    : "text-ajicolor-ink dark:text-ajicolor-ink hover:bg-white/60 dark:hover:bg-neutral-800/60"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="pt-4 mt-4 border-t border-gray-300 dark:border-neutral-700 flex items-center justify-between gap-3">
          <p className="text-[10px] text-ajicolor-ink dark:text-ajicolor-ink font-semibold uppercase tracking-widest">Ajicolor Admin v0.1.0</p>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
