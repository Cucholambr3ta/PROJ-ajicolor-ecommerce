"use client";

import type { Lado } from "./config";

const ETIQUETAS: Record<Lado, string> = {
  Frente: "Frente",
  Espalda: "Espalda",
};

/** Toggle de lado activo (CT-04/CT-07) — solo muestra los lados con zona definida. */
export default function SideToggle({
  lados,
  ladoActivo,
  onChange,
}: {
  lados: Lado[];
  ladoActivo: Lado;
  onChange: (lado: Lado) => void;
}) {
  if (lados.length <= 1) return null;

  return (
    <div className="flex gap-2" role="group" aria-label="Lado de la prenda">
      {lados.map((lado) => (
        <button
          key={lado}
          type="button"
          aria-pressed={lado === ladoActivo}
          onClick={() => onChange(lado)}
          className={`thick-border px-4 py-2 text-xs font-black uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ajicolor-magenta ${
            lado === ladoActivo
              ? "bg-ajicolor-ink text-white"
              : "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800"
          }`}
        >
          {ETIQUETAS[lado]}
        </button>
      ))}
    </div>
  );
}
