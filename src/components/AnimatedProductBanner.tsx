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

/**
 * Capa "de atrás": el triángulo TL-TR-BL del paralelogramo, pero con la
 * esquina TL empujada hacia afuera (arriba e izquierda) — pedido
 * explícito: el borde superior e izquierdo de la foto se sale del
 * cuadro y el marco morado (por encima, z-10) la tapa ahí, dando la
 * sensación de que está "metida" debajo. TR y BL quedan fijos en su
 * posición real porque son los extremos de la diagonal TR-BL, el mismo
 * borde exacto que usa FRONT_CLIP — así las dos capas calzan sin
 * superponerse ni dejar hueco.
 *
 * El contenedor de esta capa (backBoxStyle, en ProductSlot) es más
 * grande que el cuadro real — crece hacia arriba/izquierda en
 * OVERHANG% — así object-cover tiene de dónde sacar esa parte "de más"
 * en vez de mostrar solo el fondo morado de respaldo. Como el
 * contenedor cambió de tamaño, TR/BL hay que reexpresarlos en el
 * sistema de coordenadas de ESE contenedor más grande (0-100% ya no es
 * el cuadro original, sino el cuadro + el overhang).
 */
const OVERHANG = 18; // cuánto crece el contenedor hacia arriba/izquierda, en % del cuadro original
const BACK_BOX_SCALE = 1 + OVERHANG / 100;
function toBackBoxPct(xOrY: number) {
  return (OVERHANG + xOrY) / BACK_BOX_SCALE;
}
const BACK_TR = { x: toBackBoxPct(REL_TR), y: toBackBoxPct(0) };
const BACK_BL = { x: toBackBoxPct(REL_BL), y: toBackBoxPct(100) };
const BACK_CLIP = `polygon(0% 0%, ${BACK_TR.x}% ${BACK_TR.y}%, ${BACK_BL.x}% ${BACK_BL.y}%)`;

/**
 * Capa "de encima" del efecto 3D: el triángulo TR→BR→BL del MISMO
 * paralelogramo (mismo borde exacto, sin agrandarlo ni correrlo) —
 * contiene el borde DERECHO (TR-BR) y el borde INFERIOR (BR-BL), que
 * quedan por ENCIMA del marco morado, fijos en el borde real del cuadro.
 * El corte es la diagonal TR→BL del paralelogramo, igual que en
 * BACK_CLIP, para que ambas capas empalmen exacto.
 */
const FRONT_CLIP = `polygon(${REL_TR}% 0%, ${REL_BR}% 100%, ${REL_BL}% 100%)`;

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

  /**
   * La capa de atrás necesita un contenedor más grande que el cuadro real
   * (crece hacia arriba/izquierda) para que object-cover tenga de dónde
   * sacar la parte "de más" que se sale del marco — si solo se corriera
   * el clip-path sin agrandar el contenedor, ahí no habría imagen
   * (solo el fondo morado de respaldo).
   */
  const overhangX = (box.width * OVERHANG) / 100;
  const overhangY = (box.height * OVERHANG) / 100;
  const backBoxStyle = {
    left: `${box.left - overhangX}%`,
    top: `${box.top - overhangY}%`,
    width: `${box.width + overhangX}%`,
    height: `${box.height + overhangY}%`,
  };

  return (
    <>
      {/* Capa de atrás: el cuadro, por debajo del marco (pedido: borde
          superior/izquierdo deben quedar detrás de la imagen). Fondo
          morado (#4F266A, el mismo del marco) detrás de cada foto: los
          PNG de producto tienen fondo transparente y no siempre llenan
          todo el paralelogramo, así que sin esto se vería el fondo de la
          página (amarillo) en los huecos en vez de fundirse con el marco. */}
      <div className="absolute z-0" style={backBoxStyle}>
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
