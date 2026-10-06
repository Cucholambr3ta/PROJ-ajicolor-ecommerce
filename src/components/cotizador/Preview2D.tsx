"use client";

import Image from "next/image";
import type { DisenoLocal } from "./CotizadorClient";
import { type ColorPrenda, type Lado, type PrendaCotizador, zonaDeLado } from "./config";
import { fitContain } from "@/lib/cotizador/fit";

/**
 * Mockup + tinte (mix-blend-multiply) + diseño posicionado según PrendaZona.
 * Puro <div>/<img>: sin WebGL, funciona siempre (fallback de CT-08).
 */
export default function Preview2D({
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
  const zona = zonaDeLado(prenda, ladoActivo);
  const diseno = lados[ladoActivo];
  const mockupUrl = ladoActivo === "Frente" ? prenda.mockupFrenteUrl : prenda.mockupEspaldaUrl;

  // Tamaño final del diseño (en % del mockup) respetando aspect ratio + escala.
  const tamanoFinal =
    zona && diseno
      ? fitContain(
          { ancho: diseno.anchoPx, alto: diseno.altoPx },
          { ancho: zona.w2d, alto: zona.h2d },
          diseno.escalaPct,
        )
      : null;

  return (
    <div
      className="relative w-full aspect-square overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-neutral-800"
      role="img"
      aria-label={`${prenda.nombre} ${color?.nombre ?? ""}, vista ${ladoActivo === "Frente" ? "frontal" : "de espalda"}${diseno ? ", con diseño" : ""}`}
    >
      {mockupUrl ? (
        <>
          <Image src={mockupUrl} alt="" fill className="object-contain" />
          <div className="absolute inset-0 mix-blend-multiply" style={{ backgroundColor: color?.hex ?? "#e5e5e5" }} />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: color?.hex ?? "#e5e5e5" }}>
          <p className="text-xs font-bold uppercase tracking-widest text-white/40 mix-blend-difference">
            {prenda.nombre} · {color?.nombre} · {ladoActivo}
          </p>
        </div>
      )}

      {zona && diseno && tamanoFinal && (
        <div
          className="absolute flex items-center justify-center overflow-hidden"
          style={{
            left: `${zona.x2d + (zona.w2d - tamanoFinal.ancho) / 2}%`,
            top: `${zona.y2d + (zona.h2d - tamanoFinal.alto) / 2}%`,
            width: `${tamanoFinal.ancho}%`,
            height: `${tamanoFinal.alto}%`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={diseno.objectUrl} alt="Tu diseño" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  );
}
