"use client";

import dynamic from "next/dynamic";
import type { DisenoLocal } from "./CotizadorClient";
import type { Lado, PrendaCotizador } from "./config";

const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-square flex items-center justify-center bg-gray-100 dark:bg-neutral-800 animate-pulse">
      <p className="text-xs text-gray-400 dark:text-neutral-500 font-bold uppercase tracking-widest">
        Cargando vista 3D...
      </p>
    </div>
  ),
});

/** Envoltorio next/dynamic(ssr:false) del chunk three/R3F — solo carga en modo 3D (spec §7.6). */
export default function Preview3D({
  prenda,
  colorHex,
  lados,
  ladoActivo,
  onContextLost,
}: {
  prenda: PrendaCotizador;
  colorHex: string;
  lados: Partial<Record<Lado, DisenoLocal>>;
  ladoActivo: Lado;
  onContextLost: () => void;
}) {
  return (
    <div className="w-full aspect-square overflow-hidden bg-gray-100 dark:bg-neutral-800">
      <Scene3D prenda={prenda} colorHex={colorHex} lados={lados} ladoActivo={ladoActivo} onContextLost={onContextLost} />
    </div>
  );
}
