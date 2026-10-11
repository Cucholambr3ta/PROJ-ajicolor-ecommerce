"use client";

import { useRef, useState } from "react";

/**
 * Imprime la etiqueta de despacho sin navegar a /etiqueta — la carga en un
 * iframe oculto (que sigue pidiendo esa misma ruta al server, reusando toda
 * la lógica de datos y el CSS de impresión ya existentes) y dispara
 * window.print() sobre ESE iframe en cuanto termina de cargar. Al imprimir
 * sobre un iframe, el navegador solo usa el contenido de ese iframe, no el
 * de la página que lo contiene — por eso el admin (sidebar, header) nunca
 * aparece y el usuario nunca ve la URL /etiqueta ni una navegación.
 */
export default function ImprimirEtiquetaButton({ orderId }: { orderId: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [cargando, setCargando] = useState(false);

  function handleClick() {
    setCargando(true);
    const iframe = iframeRef.current;
    if (!iframe) return;
    // Forzar recarga aunque el src no cambie (mismo pedido impreso dos veces).
    iframe.src = `/admin/pedidos/${orderId}/etiqueta?print=1&t=${Date.now()}`;
  }

  function handleLoad() {
    // Guarda contra el load "en blanco" del iframe al montarse (antes de
    // cualquier click, sin src asignado) — solo imprime si vino de un click
    // real que puso un src nuevo.
    setCargando((estabaCargando) => {
      if (estabaCargando) {
        const win = iframeRef.current?.contentWindow;
        if (win) win.print();
      }
      return false;
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={cargando}
        className="px-4 py-2 rounded-md border border-gray-300 dark:border-neutral-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50"
      >
        {cargando ? "Preparando..." : "Imprimir etiqueta"}
      </button>
      <iframe ref={iframeRef} onLoad={handleLoad} title="Etiqueta de envío" className="hidden" />
    </>
  );
}
