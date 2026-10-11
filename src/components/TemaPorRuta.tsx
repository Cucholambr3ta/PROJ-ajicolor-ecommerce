"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Pone data-tema="kids" en <body> mientras la ruta activa es /kids — el
 * fondo propio de Kids (globals.css, selector [data-tema="kids"] .site-nav /
 * footer / body) solo se activa ahí, dejando el resto de la tienda intacto.
 * Header y Footer son componentes de servidor compartidos por todo el grupo
 * (tienda); no pueden leer la ruta — por eso el scoping se hace vía CSS
 * contra este atributo en vez de pasarles una prop de tema. */
export function TemaPorRuta() {
  const pathname = usePathname();
  const esKids = pathname?.startsWith("/kids") ?? false;

  useEffect(() => {
    document.body.dataset.tema = esKids ? "kids" : "";
    return () => {
      delete document.body.dataset.tema;
    };
  }, [esKids]);

  return null;
}
