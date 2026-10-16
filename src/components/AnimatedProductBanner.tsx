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
 * El PNG del marco tiene blanco SÓLIDO en los 5 cuadros (no transparente),
 * así que puesto encima de los productos los tapa por completo sin importar
 * dónde esté la foto de abajo. Se le recorta un "agujero" exacto por
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

/**
 * Una sola foto por cuadro, SIN recortes ni duplicados — más grande que
 * el hueco del marco (crece hacia arriba/izquierda/derecha/abajo por
 * igual, EXTRA_PCT% del cuadro) y detrás del marco (z-0 vs z-10). El
 * marco morado, que es opaco en todos lados menos en el hueco exacto
 * del paralelogramo, tapa solo la parte de la foto que le sobresale por
 * ENCIMA de su propio dibujo — como el marco en sí ya tiene el recorte
 * diagonal hacia abajo-derecha (ver la imagen de fondo), esa esquina de
 * la foto queda visible sin que nada la tape.
 */
const EXTRA_PCT = 35;

function ProductSlot({ tipo, index, products }: { tipo: TipoProducto; index: number; products: SlotProduct[] }) {
  const [active, setActive] = useState(0);
  const imagenes = products.length > 0 ? products.map((p) => p.disenoUrl) : [ICONO_POR_TIPO[tipo]];
  const box = shapeBoundingBox(index);

  useEffect(() => {
    if (imagenes.length <= 1) return;
    const id = setInterval(() => setActive((i) => (i + 1) % imagenes.length), 2600 + index * 350);
    return () => clearInterval(id);
  }, [imagenes.length, index]);

  const extraX = (box.width * EXTRA_PCT) / 100;
  const extraY = (box.height * EXTRA_PCT) / 100;
  const boxStyle = {
    left: `${box.left - extraX / 2}%`,
    top: `${box.top - extraY / 2}%`,
    width: `${box.width + extraX}%`,
    height: `${box.height + extraY}%`,
  };

  return (
    <div className="absolute z-0" style={{ ...boxStyle, backgroundColor: "#4F266A" }}>
      {imagenes.map((src, i) => (
        <div key={src} className="absolute inset-0 transition-opacity duration-700" style={{ opacity: i === active ? 1 : 0 }}>
          <Image src={src} alt="" fill className="object-contain" sizes="20vw" />
        </div>
      ))}
    </div>
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
      {/* El marco (morado con el texto "PRODUCTOS DEL AJÍ") va encima de
          las fotos, con los 5 cuadros recortados vía SVG clip-path (ver
          arriba) para no taparlas con su blanco sólido. Como cada foto es
          más grande que el hueco, el marco tapa naturalmente la parte que
          sobresale hacia arriba/izquierda; el recorte diagonal propio del
          marco (hacia abajo-derecha) deja ver esa esquina sin tapar. */}
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
