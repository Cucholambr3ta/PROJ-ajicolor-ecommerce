"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { AuthDrawer } from "@/components/AuthDrawer";

const CATEGORIAS = [
  { slug: "poleras", nombre: "Poleras", disponible: true },
  { slug: "polerones", nombre: "Polerones", disponible: false },
  { slug: "totebag", nombre: "Totebag", disponible: false },
  { slug: "relojes", nombre: "Relojes", disponible: false },
  { slug: "papeleria", nombre: "Papelería", disponible: false },
];

const LINKS = [
  { href: "/", label: "Catálogo" },
  { href: "/drops", label: "Drops" },
  { href: "/cotizador", label: "Cotizador" },
  { href: "/conoce-al-aji", label: "Conoce al Ají" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeaderMobileMenu({ isCliente }: { isCliente: boolean }) {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [categoriasOpen, setCategoriasOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="p-2 text-ajicolor-purple dark:text-neutral-100 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full bg-white dark:bg-neutral-900 border-t-2 border-ajicolor-ink shadow-lg z-50 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col p-4 gap-1 font-bold text-sm text-ajicolor-purple dark:text-neutral-100">
            <div className="border-b border-gray-100 dark:border-neutral-800">
              <button
                onClick={() => setCategoriasOpen((v) => !v)}
                className="w-full flex items-center justify-between px-2 py-3"
              >
                Categorías
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${categoriasOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  categoriasOpen ? "max-h-60" : "max-h-0"
                }`}
              >
                <div className="pb-2 pl-4 flex flex-col gap-1">
                  {CATEGORIAS.map((cat) =>
                    cat.disponible ? (
                      <Link
                        key={cat.slug}
                        href={`/?categoria=${cat.slug}`}
                        onClick={() => setOpen(false)}
                        className="py-2 text-sm font-semibold text-ajicolor-ink dark:text-neutral-200"
                      >
                        {cat.nombre}
                      </Link>
                    ) : (
                      <span
                        key={cat.slug}
                        className="py-2 text-sm font-semibold text-gray-300 dark:text-neutral-600 flex items-center justify-between pr-2"
                      >
                        {cat.nombre}
                        <span className="text-[9px] uppercase tracking-wide">Pronto</span>
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="px-2 py-3 border-b border-gray-100 dark:border-neutral-800 last:border-0"
              >
                {link.label}
              </Link>
            ))}
            {isCliente ? (
              <Link href="/cuenta" onClick={() => setOpen(false)} className="px-2 py-3 text-ajicolor-magenta">
                Mi cuenta
              </Link>
            ) : (
              <button
                onClick={() => {
                  setOpen(false);
                  setAuthOpen(true);
                }}
                className="px-2 py-3 text-left text-ajicolor-magenta"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}

      <AuthDrawer open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
