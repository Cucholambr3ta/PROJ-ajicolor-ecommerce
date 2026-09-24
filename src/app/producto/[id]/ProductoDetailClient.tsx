"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface Variant {
  id: string;
  talle: string;
  color: string;
  stock: number;
}

interface Product {
  id: string;
  nombreSlug: string;
  descripcion: string;
  disenoUrl: string;
  artista: string;
  temporada: string;
  precio: number | any;
  variants: Variant[];
}

const TALLES_ORDEN = ["S", "M", "L", "XL", "2XL"];

const COLOR_HEX: Record<string, string> = {
  Negro: "#1a1a1a",
  Blanco: "#fafafa",
  Gris: "#9ca3af",
  Azul: "#1e3a8a",
  Rojo: "#dc2626",
  Morado: "#4f266a",
  Amarillo: "#ffd141",
  Verde: "#1ea96a",
  Naranja: "#ea580c",
};

export default function ProductoDetailClient({ product }: { product: Product }) {
  const router = useRouter();

  const coloresDisponibles = useMemo(
    () => Array.from(new Set(product.variants.map((v) => v.color))),
    [product.variants]
  );
  const [selectedColor, setSelectedColor] = useState(coloresDisponibles[0] ?? "");

  const tallesDelColor = useMemo(
    () => product.variants.filter((v) => v.color === selectedColor),
    [product.variants, selectedColor]
  );
  const primeraConStock = tallesDelColor.find((v) => v.stock > 0);
  const [selectedTalle, setSelectedTalle] = useState(primeraConStock?.talle ?? TALLES_ORDEN[0]);

  const selectedVariant = tallesDelColor.find((v) => v.talle === selectedTalle);
  const stockTotal = product.variants.reduce((acc, v) => acc + v.stock, 0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  function handleSelectColor(color: string) {
    setSelectedColor(color);
    const variantesDelColor = product.variants.filter((v) => v.color === color);
    const conStock = variantesDelColor.find((v) => v.stock > 0);
    setSelectedTalle(conStock?.talle ?? TALLES_ORDEN[0]);
  }

  async function handleAddToCart() {
    if (!selectedVariant || selectedVariant.stock === 0) return;
    setLoading(true);
    setError("");
    setAdded(false);
    try {
      const { addToCart } = await import("@/lib/actions/cart");
      await addToCart(selectedVariant.id, 1);
      setAdded(true);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al agregar al carrito";
      if (message.includes("iniciar sesión")) {
        router.push("/login-cliente");
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto py-12 p-8">
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <div className="thick-border pop-shadow bg-white dark:bg-neutral-900 p-3">
            <p className="text-center font-black text-sm py-2 border-b-2 border-ajicolor-ink mb-3">Producto</p>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.disenoUrl} alt={product.nombreSlug} className="w-full aspect-square object-cover" />
              {stockTotal === 0 && (
                <span className="absolute top-2 left-2 bg-ajicolor-magenta text-white px-3 py-1 text-[10px] font-bold uppercase">
                  Sold out
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-3 gap-3">
              <span className="bg-ajicolor-magenta text-white px-4 py-2 text-xs font-black uppercase flex-1 text-center">
                Dale color!
              </span>
              {coloresDisponibles.length > 0 && (
                <div className="flex gap-2">
                  {coloresDisponibles.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleSelectColor(color)}
                      title={color}
                      aria-label={color}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        color === selectedColor ? "border-ajicolor-ink scale-110" : "border-gray-300 dark:border-neutral-700"
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
          <h1 className="text-5xl font-black text-ajicolor-purple leading-none mb-1">{product.artista}</h1>
          <p className="text-2xl text-ajicolor-magenta italic font-medium mb-6">{product.nombreSlug}</p>

          <p className="text-4xl font-black text-ajicolor-magenta mb-8">
            ${Number(product.precio).toLocaleString("es-CL")}
          </p>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-3">Selecciona tu talla</p>
            <div className="flex gap-2 flex-wrap">
              {TALLES_ORDEN.map((talle) => {
                const variant = tallesDelColor.find((v) => v.talle === talle);
                const disponible = !!variant && variant.stock > 0;
                return (
                  <button
                    key={talle}
                    onClick={() => disponible && setSelectedTalle(talle)}
                    disabled={!disponible}
                    className={`w-12 h-12 flex items-center justify-center thick-border font-black text-sm ${
                      talle === selectedTalle && disponible
                        ? "bg-ajicolor-ink text-white"
                        : disponible
                          ? "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800"
                          : "bg-gray-100 dark:bg-neutral-800 text-gray-300 dark:text-neutral-600 cursor-not-allowed"
                    }`}
                  >
                    {talle}
                  </button>
                );
              })}
            </div>
            {selectedVariant && selectedVariant.stock > 0 && (
              <p className="text-xs text-gray-400 dark:text-neutral-500 font-medium mt-2">{selectedVariant.stock} disponibles</p>
            )}
          </div>

          <div>
            <p className="bg-ajicolor-ink text-white px-3 py-1.5 text-xs font-bold uppercase inline-block mb-0">
              Especificación técnica
            </p>
            <div className="thick-border p-4 text-sm italic text-gray-600 dark:text-neutral-300 font-medium">
              Polera {product.artista} Hombre MC
              <br />
              100% Algodón Heavy Weight · 195 Grs
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-ajicolor-magenta mt-4">{error}</p>}
          {added && <p className="text-sm font-semibold text-ajicolor-green mt-4">Agregado al carrito.</p>}

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock === 0 || loading}
            className="btn-block w-full justify-center py-4 mt-8 bg-ajicolor-yellow text-base disabled:opacity-40"
          >
            {!selectedVariant || selectedVariant.stock === 0
              ? "Sin stock"
              : loading
                ? "Agregando..."
                : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </main>
  );
}
