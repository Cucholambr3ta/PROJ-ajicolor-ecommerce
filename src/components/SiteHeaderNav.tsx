"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const CATEGORIAS = [
  { slug: "poleras", nombre: "Poleras", disponible: true },
  { slug: "polerones", nombre: "Polerones", disponible: false },
  { slug: "totebag", nombre: "Totebag", disponible: false },
  { slug: "relojes", nombre: "Relojes", disponible: false },
  { slug: "papeleria", nombre: "Papelería", disponible: false },
];

const NAV_LINKS = [
  { href: "/", label: "Catálogo" },
  { href: "/drops", label: "Drops" },
  { href: "/cotizador", label: "Cotizador" },
  { href: "/conoce-al-aji", label: "Conoce al Ají" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeaderNav() {
  const pathname = usePathname();
  const [categoriasOpen, setCategoriasOpen] = useState(false);

  return (
    <div className="site-nav-bottom hidden lg:flex font-bold text-sm text-ajicolor-purple dark:text-neutral-100">
      <div
        className="relative"
        onMouseEnter={() => setCategoriasOpen(true)}
        onMouseLeave={() => setCategoriasOpen(false)}
      >
        <Link
          href="/categorias"
          className={`flex items-center gap-1 transition-colors hover:text-ajicolor-magenta ${
            pathname === "/categorias" ? "underline decoration-2 underline-offset-4" : ""
          }`}
        >
          Categorías
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform duration-200 ${categoriasOpen ? "rotate-180" : ""}`}
          />
        </Link>

        <div
          className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-200 ${
            categoriasOpen
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 -translate-y-1 pointer-events-none"
          }`}
        >
          <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow-sm py-2 min-w-[180px]">
            {CATEGORIAS.map((cat) =>
              cat.disponible ? (
                <Link
                  key={cat.slug}
                  href={`/?categoria=${cat.slug}`}
                  className="block px-4 py-2 text-sm font-bold text-ajicolor-ink dark:text-neutral-100 hover:bg-ajicolor-yellow hover:text-ajicolor-ink transition-colors"
                >
                  {cat.nombre}
                </Link>
              ) : (
                <span
                  key={cat.slug}
                  title="Próximamente"
                  className="flex items-center justify-between px-4 py-2 text-sm font-bold text-gray-300 dark:text-neutral-600 cursor-not-allowed"
                >
                  {cat.nombre}
                  <span className="text-[9px] uppercase tracking-wide">Pronto</span>
                </span>
              )
            )}
          </div>
        </div>
      </div>

      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`transition-colors hover:text-ajicolor-magenta ${
            pathname === link.href ? "underline decoration-2 underline-offset-4" : ""
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
