"use client";

import { useRef } from "react";
import type { DisenoLocal } from "./CotizadorClient";
import { ESCALA_DEFAULT, ESCALA_MAX, ESCALA_MIN } from "@/lib/cotizador/fit";
import { readImageDimensions } from "@/lib/cotizador/image-meta";
import type { Lado } from "./config";

/** Upload local por lado + slider de escala 50–100% (CT-05/CT-06). */
export default function DesignControls({
  lado,
  diseno,
  onChange,
  onEscalaChange,
}: {
  lado: Lado;
  diseno: DisenoLocal | undefined;
  onChange: (diseno: DisenoLocal | null) => void;
  onEscalaChange: (escalaPct: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null) {
    if (!file) {
      onChange(null);
      return;
    }
    try {
      const { ancho, alto } = await readImageDimensions(file);
      const objectUrl = URL.createObjectURL(file);
      onChange({ file, objectUrl, anchoPx: ancho, altoPx: alto, escalaPct: ESCALA_DEFAULT });
    } catch {
      onChange(null);
    }
  }

  return (
    <div className="space-y-3">
      <label htmlFor={`diseno-${lado}`} className="block text-xs font-bold uppercase tracking-widest mb-2">
        Diseño para {lado === "Frente" ? "el frente" : "la espalda"}
      </label>
      <input
        ref={inputRef}
        id={`diseno-${lado}`}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        className="w-full text-sm"
      />

      {diseno && (
        <div className="flex items-center gap-3">
          <label htmlFor={`escala-${lado}`} className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            Tamaño
          </label>
          <input
            id={`escala-${lado}`}
            type="range"
            min={ESCALA_MIN}
            max={ESCALA_MAX}
            step={1}
            value={diseno.escalaPct}
            onChange={(e) => onEscalaChange(parseInt(e.target.value, 10))}
            className="flex-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ajicolor-magenta"
            aria-label={`Escala del diseño de ${lado}`}
          />
          <span className="text-xs font-mono w-10 text-right">{diseno.escalaPct}%</span>
          <button
            type="button"
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              onChange(null);
            }}
            className="text-xs font-bold text-ajicolor-magenta underline"
          >
            Quitar
          </button>
        </div>
      )}
    </div>
  );
}
