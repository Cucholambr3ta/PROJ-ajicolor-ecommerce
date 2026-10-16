"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

type TipoProducto = "Polera" | "Poleron" | "Totebag" | "Reloj" | "Papeleria";

interface SlotProduct {
  id: string;
  nombre: string;
  disenoUrl: string;
}

const ICONO_POR_TIPO: Record<TipoProducto, string> = {
  Polera: "/carousel/polera.png",
  Poleron: "/carousel/poleron.png",
  Totebag: "/carousel/totebag.png",
  Reloj: "/carousel/reloj.png",
  Papeleria: "/carousel/cuadro.png",
};

/**
 * Geometría de los 5 cuadros blancos del fondo (medida en
 * public/banners/FONDO BANNER PRODUCTOS ANIMACION_.png, 1920×420px),
 * expresada en % del banner para que escale con aspect-[1920/420].
 * Cada cuadro es un paralelogramo idéntico (mismo ancho, inclinado hacia
 * la izquierda de arriba a abajo), solo trasladado horizontalmente.
 */
const SHAPE_TOP_PCT = 26.905;
const SHAPE_BOTTOM_PCT = 91.429;
const SHAPE_WIDTH_PCT = 12.865;
const SHAPE_SHEAR_PCT = 6.719; // cuánto más a la derecha está el borde superior que el inferior
const SHAPE_PERIOD_PCT = 17.474;
const SHAPE0_BOTTOM_LEFT_PCT = 6.615;

function shapeCorners(index: number) {
  const bl = SHAPE0_BOTTOM_LEFT_PCT + SHAPE_PERIOD_PCT * index;
  const br = bl + SHAPE_WIDTH_PCT;
  const tl = bl + SHAPE_SHEAR_PCT;
  const tr = tl + SHAPE_WIDTH_PCT;
  return { tl, tr, br, bl };
}

/** Caja contenedora (rectángulo) de cada paralelogramo, en % del banner. */
function shapeBoundingBox(index: number) {
  const { tl, tr, br, bl } = shapeCorners(index);
  const left = Math.min(tl, bl);
  const right = Math.max(tr, br);
  return { left, top: SHAPE_TOP_PCT, width: right - left, height: SHAPE_BOTTOM_PCT - SHAPE_TOP_PCT };
}

/**
 * Las 5 cajas tienen el mismo ancho/alto (solo cambia su posición
 * horizontal), así que el paralelogramo relativo a SU PROPIA caja es
 * idéntico para las 5 — estas constantes son fijas, no por índice.
 * Antes el clip-path usaba % del banner COMPLETO sobre una imagen que
 * ocupaba todo el ancho del banner (object-cover la hacía angosta y
 * centrada): el recorte caía fuera de donde realmente estaba la foto.
 * Ahora cada <Image> vive en un contenedor del tamaño real del cuadro,
 * así que object-cover encuadra sobre ESE rectángulo chico.
 */
const REL_TL = 34.309;
const REL_TR = 100;
const REL_BR = 65.691;
const REL_BL = 0;

const BACK_CLIP = `polygon(${REL_TL}% 0%, ${REL_TR}% 0%, ${REL_BR}% 100%, ${REL_BL}% 100%)`;

/**
 * Capa "de encima" del efecto 3D: solo el borde inferior y derecho del
 * cuadro, un poco más grande que el paralelogramo real — pedido
 * explícito, para que esos dos bordes se vean por ENCIMA del marco
 * morado mientras el resto de la imagen queda por DETRÁS.
 */
const FRONT_CLIP = (() => {
  const marginX = 3; // % de la caja del cuadro (mucho más chica que el banner entero)
  const marginY = 2.5;
  const midTop = REL_TL + (REL_TR - REL_TL) * 0.48;
  const midBottom = REL_BL + (REL_BR - REL_BL) * 0.48;
  return `polygon(${midTop}% 0%, ${REL_TR + marginX}% 0%, ${REL_BR + marginX}% ${100 + marginY}%, ${REL_BL + marginX}% ${100 + marginY}%, ${midBottom + marginX}% 100%)`;
})();

/**
 * El PNG del marco tiene blanco SÓLIDO en los 5 cuadros (no transparente),
 * así que puesto encima de los productos los tapa por completo sin importar
 * el clip-path de las capas de abajo. Se le recorta un "agujero" exacto por
 * cuadro con un <clipPath> SVG (evenodd: rectángulo completo menos los 5
 * paralelogramos) — clip-path de CSS no soporta agujeros con polygon()
 * solo, pero sí referenciando un clipPath SVG por id.
 */
function FrameHolesClipDef() {
  const outer = "M0,0 L100,0 L100,100 L0,100 Z";
  const holes = Array.from({ length: 5 }, (_, i) => {
    const { tl, tr, br, bl } = shapeCorners(i);
    return `M${tl},${SHAPE_TOP_PCT} L${tr},${SHAPE_TOP_PCT} L${br},${SHAPE_BOTTOM_PCT} L${bl},${SHAPE_BOTTOM_PCT} Z`;
  }).join(" ");

  return (
    <svg width="0" height="0" className="absolute">
      <defs>
        <clipPath id="animated-banner-frame-holes" clipPathUnits="objectBoundingBox" clipRule="evenodd">
          <path transform="scale(0.01 0.01)" d={`${outer} ${holes}`} />
        </clipPath>
      </defs>
    </svg>
  );
}

function ProductSlot({ tipo, index, products }: { tipo: TipoProducto; index: number; products: SlotProduct[] }) {
  const [active, setActive] = useState(0);
  const imagenes = products.length > 0 ? products.map((p) => p.disenoUrl) : [ICONO_POR_TIPO[tipo]];
  const box = shapeBoundingBox(index);

  useEffect(() => {
    if (imagenes.length <= 1) return;
    const id = setInterval(() => setActive((i) => (i + 1) % imagenes.length), 2600 + index * 350);
    return () => clearInterval(id);
  }, [imagenes.length, index]);

  const boxStyle = {
    left: `${box.left}%`,
    top: `${box.top}%`,
    width: `${box.width}%`,
    height: `${box.height}%`,
  };

  return (
    <>
      {/* Capa de atrás: el cuadro, por debajo del marco (pedido: borde
          superior/izquierdo deben quedar detrás de la imagen). Fondo
          morado (#4F266A, el mismo del marco) detrás de cada foto: los
          PNG de producto tienen fondo transparente y no siempre llenan
          todo el paralelogramo, así que sin esto se vería el fondo de la
          página (amarillo) en los huecos en vez de fundirse con el marco. */}
      <div className="absolute z-0" style={boxStyle}>
        {imagenes.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0, clipPath: BACK_CLIP, backgroundColor: "#4F266A" }}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="20vw" />
          </div>
        ))}
      </div>
      {/* Capa de adelante: franja inferior/derecha, por encima del marco. */}
      <div className="absolute z-20" style={boxStyle}>
        {imagenes.map((src, i) => (
          <div
            key={src}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0, clipPath: FRONT_CLIP }}
          >
            <Image src={src} alt="" fill className="object-cover" sizes="20vw" />
          </div>
        ))}
      </div>
    </>
  );
}

export function AnimatedProductBanner({
  linkUrl,
  productosPorTipo,
}: {
  linkUrl: string;
  productosPorTipo: Record<TipoProducto, SlotProduct[]>;
}) {
  const tipos: TipoProducto[] = ["Polera", "Poleron", "Totebag", "Reloj", "Papeleria"];

  return (
    <Link href={linkUrl} className="relative block w-full h-full">
      <FrameHolesClipDef />
      {tipos.map((tipo, i) => (
        <ProductSlot key={tipo} tipo={tipo} index={i} products={productosPorTipo[tipo]} />
      ))}
      {/* El marco (morado con el texto "PRODUCTOS DEL AJÍ") va al medio,
          con los 5 cuadros recortados vía SVG clip-path (ver arriba) para
          que no tapen el producto de abajo con su blanco sólido: tapa el
          borde superior/izquierdo de cada producto (capa de atrás) y queda
          tapado por la franja inferior/derecha (capa de adelante, z-20). */}
      <Image
        src="/banners/FONDO BANNER PRODUCTOS ANIMACION_.png"
        alt=""
        fill
        className="object-cover z-10 pointer-events-none"
        style={{ clipPath: "url(#animated-banner-frame-holes)" }}
        sizes="100vw"
      />
    </Link>
  );
}
