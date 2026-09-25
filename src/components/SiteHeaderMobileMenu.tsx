"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AuthDrawer } from "@/components/AuthDrawer";

const LINKS = [
  { href: "/conoce-al-aji", label: "Conoce al Ají" },
  { href: "/", label: "Catálogo" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeaderMobileMenu({ isCliente }: { isCliente: boolean }) {
  const [open, setOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full bg-white dark:bg-neutral-900 border-t-2 border-ajicolor-ink shadow-lg z-50">
          <div className="flex flex-col p-4 gap-1 font-bold text-sm text-ajicolor-purple">
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
