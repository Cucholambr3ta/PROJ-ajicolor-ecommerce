"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TALLES_KIDS } from "@/lib/kids";

interface Variant {
  id: string;
  talle: string;
  color: string;
  stock: number;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
}

interface ColorImage {
  color: string;
  lado: "Frente" | "Espalda";
  url: string;
}

interface ColorInfo {
  nombre: string;
  hex: string;
}

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  disenoUrl: string;
  artista: string;
  temporada: string;
  categoria: "Adulto" | "Kids";
  precio: number | any;
  variants: Variant[];
  images?: ProductImage[];
  colorImages: ColorImage[];
}

const CANTIDAD_MAXIMA = 10;

const TALLES_ADULTO = ["S", "M", "L", "XL", "2XL"];

const MEDIDAS_POR_TALLE_ADULTO: Record<string, { ancho: number; largo: number }> = {
  S: { ancho: 48, largo: 68 },
  M: { ancho: 51, largo: 70 },
  L: { ancho: 54, largo: 72 },
  XL: { ancho: 57, largo: 74 },
  "2XL": { ancho: 60, largo: 76 },
};

// Medidas Kids provisionales (por edad) — a reemplazar cuando llegue la
// tabla real de medidas de la línea infantil.
const MEDIDAS_POR_TALLE_KIDS: Record<string, { ancho: number; largo: number }> = {
  "2-4": { ancho: 30, largo: 40 },
  "6-8": { ancho: 34, largo: 46 },
  "10-12": { ancho: 38, largo: 52 },
  "14-16": { ancho: 42, largo: 58 },
};

export default function ProductoDetailClient({ product, colores }: { product: Product; colores: ColorInfo[] }) {
  const router = useRouter();

  const esKids = product.categoria === "Kids";
  const TALLES_ORDEN = esKids ? TALLES_KIDS : TALLES_ADULTO;
  const MEDIDAS_POR_TALLE = esKids ? MEDIDAS_POR_TALLE_KIDS : MEDIDAS_POR_TALLE_ADULTO;
  const COLOR_HEX: Record<string, string> = useMemo(
    () => Object.fromEntries(colores.map((c) => [c.nombre, c.hex])),
    [colores]
  );

  const gallery = product.images && product.images.length > 0 ? product.images : [{ id: "main", url: product.disenoUrl, alt: product.nombre }];
  const [activeImage, setActiveImage] = useState(0);

  // Foto por color real: viene de ProductColorImage (subida desde el panel
  // admin a Supabase Storage) — ya llega filtrada y lista desde el server,
  // sin necesidad de probar archivos estáticos en el cliente. Cada color
  // puede tener frente y/o espalda.
  const fotoPorColor = useMemo(() => {
    const mapa: Record<string, { frente?: string; espalda?: string }> = {};
    for (const ci of product.colorImages) {
      const entry = mapa[ci.color] ?? {};
      if (ci.lado === "Frente") entry.frente = ci.url;
      else entry.espalda = ci.url;
      mapa[ci.color] = entry;
    }
    return mapa;
  }, [product.colorImages]);

  const coloresConFoto = useMemo(
    () => Object.keys(fotoPorColor).filter((c) => fotoPorColor[c].frente),
    [fotoPorColor]
  );
  const tieneSelectorColor = coloresConFoto.length > 0;

  const [ladoActivo, setLadoActivo] = useState<"frente" | "espalda">("frente");

  // El back-end (page.tsx) ya filtra product.variants para incluir solo
  // colores con foto de frente subida — ningún color "sin foto" llega acá
  // como opción comprable.
  const coloresDisponibles = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.color))),
    [product.variants]
  );
  const [selectedColor, setSelectedColor] = useState(coloresDisponibles[0] ?? "");
  // Preview en vivo al pasar el mouse por un swatch, sin confirmar la
  // selección todavía (eso sigue pasando solo al hacer clic, que también
  // actualiza la talla disponible — el hover no debe tocar la talla).
  const [colorHover, setColorHover] = useState<string | null>(null);
  const colorEnPreview = colorHover ?? selectedColor;

  // El toggle Frente/Espalda solo aparece si el color en preview tiene
  // ambas fotos — si solo hay frente (espalda no subida todavía), se
  // oculta y se muestra esa única foto sin pedir elegir lado.
  const tieneEspalda = Boolean(fotoPorColor[colorEnPreview]?.espalda);

  useEffect(() => {
    if (!tieneEspalda) setLadoActivo("frente");
  }, [tieneEspalda]);

  const tallesDelColor = useMemo(
    () => product.variants.filter((v) => v.color === selectedColor),
    [product.variants, selectedColor]
  );
  const [selectedTalle, setSelectedTalle] = useState(tallesDelColor[0]?.talle ?? TALLES_ORDEN[0]);

  const selectedVariant = tallesDelColor.find((v) => v.talle === selectedTalle);

  const [cantidad, setCantidad] = useState(1);
  const [showGuia, setShowGuia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  function handleSelectColor(color: string) {
    setSelectedColor(color);
    const variantesDelColor = product.variants.filter((v) => v.color === color);
    setSelectedTalle(variantesDelColor[0]?.talle ?? TALLES_ORDEN[0]);
  }

  async function handleAddToCart() {
    if (!selectedVariant) return;
    setLoading(true);
    setError("");
    setAdded(false);
    try {
      const { addToCart } = await import("@/lib/actions/cart");
      await addToCart(selectedVariant.id, cantidad);
      setAdded(true);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al agregar al carrito";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto py-12 p-8">
      <div className="grid lg:grid-cols-[3fr_2fr] gap-12">
        <div>
          <div className="thick-border pop-shadow bg-white dark:bg-neutral-900 p-3">
            <div className="flex items-center justify-between mb-3 border-b-2 border-ajicolor-ink pb-2">
              <p className="font-black text-sm">Producto</p>
              {tieneSelectorColor && tieneEspalda && (
                <div className="flex gap-1">
                  {(["frente", "espalda"] as const).map((lado) => (
                    <button
                      key={lado}
                      onClick={() => setLadoActivo(lado)}
                      className={`px-3 py-1 text-[10px] font-black uppercase tracking-wide thick-border ${
                        ladoActivo === lado
                          ? "bg-ajicolor-purple text-white dark:bg-ajicolor-ink"
                          : "bg-white dark:bg-neutral-900 text-ajicolor-ink dark:text-neutral-100"
                      }`}
                    >
                      {lado === "frente" ? "Frente" : "Espalda"}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {tieneSelectorColor ? (
              <div className="relative w-full aspect-square overflow-hidden">
                {coloresConFoto.map((color) => {
                  const foto = fotoPorColor[color];
                  const src = ladoActivo === "espalda" && foto.espalda ? foto.espalda : foto.frente;
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={color}
                      src={src}
                      alt={`${product.nombre} — ${color} — ${ladoActivo}`}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ease-out"
                      style={{ opacity: color === colorEnPreview ? 1 : 0 }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gallery[activeImage]?.url ?? product.disenoUrl}
                  alt={gallery[activeImage]?.alt ?? product.nombre}
                  className="w-full aspect-square object-cover"
                />
              </div>
            )}
            {!tieneSelectorColor && gallery.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {gallery.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 shrink-0 thick-border overflow-hidden ${i === activeImage ? "ring-2 ring-ajicolor-magenta" : ""}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3">
              <span className="block w-full bg-ajicolor-magenta text-white px-4 py-2 text-xs font-black uppercase text-center mb-3">
                Dale color!
              </span>
              {coloresDisponibles.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 justify-center">
                  {coloresDisponibles.map((color) => (
                    <motion.button
                      key={color}
                      onClick={() => handleSelectColor(color)}
                      onMouseEnter={() => fotoPorColor[color]?.frente && setColorHover(color)}
                      onMouseLeave={() => setColorHover(null)}
                      onFocus={() => fotoPorColor[color]?.frente && setColorHover(color)}
                      onBlur={() => setColorHover(null)}
                      title={color}
                      aria-label={color}
                      aria-pressed={color === selectedColor}
                      whileHover={{ scale: 1.35 }}
                      whileTap={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      className={`w-7 h-7 shrink-0 rounded-full border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ajicolor-magenta ${
                        color === selectedColor ? "border-ajicolor-magenta" : "border-gray-300 dark:border-neutral-700"
                      }`}
                      style={{ backgroundColor: COLOR_HEX[color] ?? "#ccc" }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-black text-ajicolor-purple dark:text-neutral-100 leading-none mb-1">{product.artista}</h1>
          <p className="text-2xl text-ajicolor-magenta italic font-medium mb-2">{product.nombre}</p>
          {product.descripcion && (
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">{product.descripcion}</p>
          )}

          <p className="text-4xl font-black text-ajicolor-magenta mb-8">
            ${Number(product.precio).toLocaleString("es-CL")}
          </p>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest">Selecciona tu talla</p>
              <button
                onClick={() => setShowGuia((v) => !v)}
                className="text-xs font-bold text-ajicolor-purple dark:text-neutral-100 hover:underline"
              >
                Guía de tallas
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {TALLES_ORDEN.map((talle) => {
                const variant = tallesDelColor.find((v) => v.talle === talle);
                if (!variant) return null;
                return (
                  <button
                    key={talle}
                    onClick={() => setSelectedTalle(talle)}
                    className={`w-12 h-12 flex items-center justify-center thick-border font-black text-sm ${
                      talle === selectedTalle
                        ? "bg-ajicolor-purple text-white dark:bg-ajicolor-ink"
                        : "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {talle}
                  </button>
                );
              })}
            </div>

            {showGuia && (
              <table className="w-full text-xs mt-4 border-collapse">
                <thead>
                  <tr className="border-b-2 border-ajicolor-ink text-left">
                    <th className="py-1">Talla</th>
                    <th className="py-1">Ancho (cm)</th>
                    <th className="py-1">Largo (cm)</th>
                  </tr>
                </thead>
                <tbody>
                  {TALLES_ORDEN.map((talle) => (
                    <tr key={talle} className="border-b border-gray-200 dark:border-neutral-700">
                      <td className="py-1 font-bold">{talle}</td>
                      <td className="py-1">{MEDIDAS_POR_TALLE[talle].ancho}</td>
                      <td className="py-1">{MEDIDAS_POR_TALLE[talle].largo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {selectedVariant && (
              <p className="text-xs text-gray-400 dark:text-neutral-500 font-medium mt-2">
                {selectedVariant.stock > 0
                  ? `${selectedVariant.stock} pieza${selectedVariant.stock === 1 ? "" : "s"} lista${selectedVariant.stock === 1 ? "" : "s"} — envío inmediato`
                  : "Se produce en 5 a 7 días hábiles tras confirmar el pago"}
              </p>
            )}
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-3">Cantidad</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="w-10 h-10 thick-border bg-white dark:bg-neutral-900 font-black"
              >
                −
              </button>
              <span className="w-10 text-center font-bold text-lg">{cantidad}</span>
              <button
                onClick={() => setCantidad((c) => Math.min(CANTIDAD_MAXIMA, c + 1))}
                className="w-10 h-10 thick-border bg-white dark:bg-neutral-900 font-black"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <p className="bg-ajicolor-purple text-white dark:bg-ajicolor-ink px-3 py-1.5 text-xs font-bold uppercase inline-block mb-0">
              Especificación técnica
            </p>
            <div className="thick-border p-4 text-sm italic text-gray-600 dark:text-neutral-300 font-medium">
              Polera {product.artista} {esKids ? "Kids" : "Hombre"} MC
              <br />
              100% Algodón Heavy Weight · 195 Grs
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-ajicolor-magenta mt-4">{error}</p>}
          {added && <p className="text-sm font-semibold text-ajicolor-green mt-4">Agregado al carrito.</p>}

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || loading}
            className="btn-block w-full justify-center py-4 mt-8 bg-ajicolor-yellow text-base disabled:opacity-40"
          >
            {loading ? "Agregando..." : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </main>
  );
}
