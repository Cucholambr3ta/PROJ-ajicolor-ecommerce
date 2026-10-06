"use client";

import { useEffect, useState } from "react";
import Preview2D from "./Preview2D";
import Preview3D from "./Preview3D";
import ErrorBoundary from "./ErrorBoundary";
import type { DisenoLocal } from "./CotizadorClient";
import { type ColorPrenda, type Lado, type PrendaCotizador, soporta3D } from "./config";

/** Detecta WebGL disponible probando crear un contexto en un canvas descartable. */
function hayWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Dispositivo débil/móvil (spec §7.6: puntero grueso + pocos núcleos) → arranca en 2D. */
function esDispositivoDebil(): boolean {
  const esTactil = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const pocosNucleos = typeof navigator !== "undefined" && !(navigator.hardwareConcurrency > 4);
  return esTactil && pocosNucleos;
}

/** Decide 2D/3D por defecto, expone el toggle, y aplica el fallback de robustez (CT-08). */
export default function PreviewSwitcher({
  prenda,
  color,
  lados,
  ladoActivo,
}: {
  prenda: PrendaCotizador;
  color: ColorPrenda | undefined;
  lados: Partial<Record<Lado, DisenoLocal>>;
  ladoActivo: Lado;
}) {
  const [modo, setModo] = useState<"2d" | "3d">("2d");
  const [puede3D, setPuede3D] = useState(false);
  const [avisoContextoPerdido, setAvisoContextoPerdido] = useState(false);

  useEffect(() => {
    const disponible = hayWebGL() && !esDispositivoDebil() && soporta3D(prenda);
    setPuede3D(disponible);
    setModo(disponible ? "3d" : "2d");
    // Solo se evalúa una vez al montar — el toggle manual del usuario después prevalece.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleContextLost() {
    setAvisoContextoPerdido(true);
    setModo("2d");
  }

  const preview2D = <Preview2D prenda={prenda} color={color} lados={lados} ladoActivo={ladoActivo} />;

  return (
    <div>
      {soporta3D(prenda) && (
        <div className="flex justify-end mb-2" role="group" aria-label="Modo de vista previa">
          <div className="inline-flex thick-border overflow-hidden">
            <button
              type="button"
              aria-pressed={modo === "2d"}
              onClick={() => setModo("2d")}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest focus-visible:outline focus-visible:outline-2 focus-visible:outline-ajicolor-magenta ${
                modo === "2d" ? "bg-ajicolor-ink text-white" : "bg-white dark:bg-neutral-900"
              }`}
            >
              2D
            </button>
            <button
              type="button"
              aria-pressed={modo === "3d"}
              disabled={!puede3D}
              onClick={() => setModo("3d")}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ajicolor-magenta ${
                modo === "3d" ? "bg-ajicolor-ink text-white" : "bg-white dark:bg-neutral-900"
              }`}
            >
              3D
            </button>
          </div>
        </div>
      )}

      {avisoContextoPerdido && (
        <p className="text-xs font-semibold text-ajicolor-magenta mb-2">
          Se perdió el contexto 3D de tu navegador — seguimos en vista 2D, tu diseño no se perdió.
        </p>
      )}

      {modo === "3d" && prenda.modelo3dUrl ? (
        <ErrorBoundary fallback={preview2D}>
          <Preview3D
            prenda={prenda}
            colorHex={color?.hex ?? "#e5e5e5"}
            lados={lados}
            ladoActivo={ladoActivo}
            onContextLost={handleContextLost}
          />
        </ErrorBoundary>
      ) : (
        preview2D
      )}
    </div>
  );
}
