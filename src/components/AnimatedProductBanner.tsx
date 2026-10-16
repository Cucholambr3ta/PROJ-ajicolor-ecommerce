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
const SHAPE_TOP_PCT = 26.667;
const SHAPE_BOTTOM_PCT = 91.905;
const SHAPE_WIDTH_PCT = 12.865;
const SHAPE_SHEAR_PCT = 6.719; // cuánto más a la derecha está el borde superior que el inferior
const SHAPE_PERIOD_PCT = 17.5;
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
 */
const REL_TR = 100;
const REL_BR = 65.691;
const REL_BL = 0;

/**
 * La foto es más grande que el cuadro real (crece hacia arriba/
 * izquierda/derecha — ver boxStyle en ProductSlot) para tener margen de
 * sobra. El clip-path de abajo decide qué se ve: pedido explícito
 * confirmado con un mockup — el borde derecho e inferior quedan
 * "fijos" (recortados justo en el borde real del cuadro, TR→BR→BL),
 * mientras que el superior e izquierdo quedan LIBRES, sin nada que los
 * tape. El punto muy lejos hacia arriba-izquierda hace que ese lado del
 * polígono quede "abierto" dentro de la caja agrandada.
 *
 * El crecimiento vertical (GROW_Y_PCT) y horizontal (GROW_X_PCT) van
 * por separado: con un solo GROW_PCT para los 4 lados, agrandar lo
 * suficiente para que no se corte ninguna prenda (cuellos, capuchas)
 * también agranda tanto el ancho que el product rotation empieza a
 * pisar el título "PRODUCTOS DEL AJÍ". El alto necesita bastante más
 * margen que el ancho porque ahí es donde las prendas (polerón, cuadro)
 * se cortaban.
 *
 * Como la caja de la imagen ahora es más grande que el cuadro original,
 * las coordenadas de TR/BR/BL hay que reexpresarlas en el sistema de
 * esa caja más grande (0-100% ya no es el cuadro, es cuadro + margen).
 */
const GROW_X_PCT = 8; // cuánto crece el ancho hacia cada lado, en % del cuadro original
const GROW_Y_PCT = 15; // cuánto crece el alto hacia arriba, en % del cuadro original —
// con object-contain (no recorta nunca, ver más abajo) no hace falta tanto
// margen como con object-cover; un valor bajo acerca los productos al
// cuadro real y los aleja del título "PRODUCTOS DEL AJÍ" (pedido explícito).
const GROW_X_SCALE = 1 + (2 * GROW_X_PCT) / 100;
const GROW_Y_SCALE = 1 + GROW_Y_PCT / 100; // solo crece hacia ARRIBA, no hacia abajo
function toGrownBoxPctX(originalPct: number) {
  return (GROW_X_PCT + originalPct) / GROW_X_SCALE;
}
function toGrownBoxPctY(originalPct: number) {
  return (GROW_Y_PCT + originalPct) / GROW_Y_SCALE;
}
function productClipForGrownBox() {
  const tr = { x: toGrownBoxPctX(REL_TR), y: toGrownBoxPctY(0) };
  const br = { x: toGrownBoxPctX(REL_BR), y: 100 };
  const bl = { x: toGrownBoxPctX(REL_BL), y: 100 };
  return `polygon(${-GROW_X_PCT}% ${-GROW_Y_PCT}%, ${tr.x}% ${tr.y}%, ${br.x}% ${br.y}%, ${bl.x}% ${bl.y}%)`;
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

  /**
   * La caja de la foto es más grande que el cuadro real — crece hacia
   * los costados (GROW_X_PCT) y hacia ARRIBA solamente (GROW_Y_PCT, el
   * doble aprox. — las prendas necesitan bastante más margen vertical
   * para no cortarse) — así object-cover tiene más imagen disponible
   * para sobresalir por arriba/izquierda. El clip-path (definido contra
   * el cuadro real, no contra esta caja agrandada) decide qué parte de
   * esa imagen más grande queda visible: libre arriba/izquierda,
   * recortada justo en el borde real abajo/derecha.
   */
  const growX = (box.width * GROW_X_PCT) / 100;
  const growY = (box.height * GROW_Y_PCT) / 100;
  const boxStyle = {
    left: `${box.left - growX}%`,
    top: `${box.top - growY}%`,
    width: `${box.width + growX * 2}%`,
    height: `${box.height + growY}%`,
  };

  return (
    <div className="absolute z-20" style={boxStyle}>
      {imagenes.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === active ? 1 : 0, clipPath: productClipForGrownBox() }}
        >
          <Image src={src} alt="" fill className="object-contain object-bottom" sizes="20vw" />
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
      {tipos.map((tipo, i) => (
        <ProductSlot key={tipo} tipo={tipo} index={i} products={productosPorTipo[tipo]} />
      ))}
      {/* El marco (morado con el texto "PRODUCTOS DEL AJÍ") va por DEBAJO
          de las fotos (z-10 < z-20): las fotos quedan libres para
          sobresalir del cuadro hacia arriba/izquierda (ahí no hay nada
          que las tape), y su propio clip-path (PRODUCT_CLIP) las recorta
          justo en el borde real del cuadro hacia abajo/derecha. */}
      <Image
        src="/banners/FONDO BANNER PRODUCTOS ANIMACION_.png"
        alt=""
        fill
        className="object-cover z-10 pointer-events-none"
        sizes="100vw"
      />
    </Link>
  );
}
