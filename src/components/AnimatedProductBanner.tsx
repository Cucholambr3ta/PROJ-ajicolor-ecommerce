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
 * la izquierda de arriba a abajo), solo trasladado horizontalmente. El
 * cuadro ya no recorta nada — solo ubica dónde centrar cada foto (ver
 * referencia del cliente: el producto se ve completo, el paralelogramo
 * blanco es puro fondo decorativo).
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
 * La foto no se recorta — pedido explícito confirmado con la imagen de
 * referencia del cliente: el producto se ve 100% completo (sin
 * diagonales ni bordes tapados), el paralelogramo blanco del fondo es
 * puro elemento decorativo. La caja de cada foto es más grande que el
 * cuadro real (EXTRA_PCT% hacia cada lado) para que el producto se vea
 * a buen tamaño sin quedar apretado dentro del paralelogramo angosto.
 */
const EXTRA_PCT = 15;

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
    left: `${box.left - extraX}%`,
    top: `${box.top - extraY}%`,
    width: `${box.width + extraX * 2}%`,
    height: `${box.height + extraY * 2}%`,
  };

  return (
    <div className="absolute z-20" style={boxStyle}>
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
      {/* El marco (morado con el texto "PRODUCTOS DEL AJÍ" y los cuadros
          blancos diagonales) es puro fondo decorativo, por DEBAJO de las
          fotos (z-10 < z-20) — pedido explícito confirmado con una
          referencia: el producto se ve completo, nada lo recorta. */}
      <Image
        src="/banners/FONDO BANNER PRODUCTOS ANIMACION_.png"
        alt=""
        fill
        className="object-cover z-10 pointer-events-none"
        sizes="100vw"
      />
      {tipos.map((tipo, i) => (
        <ProductSlot key={tipo} tipo={tipo} index={i} products={productosPorTipo[tipo]} />
      ))}
    </Link>
  );
}
