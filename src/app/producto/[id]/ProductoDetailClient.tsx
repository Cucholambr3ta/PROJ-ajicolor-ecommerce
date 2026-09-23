"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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

export default function ProductoDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const variantesConStock = product.variants.filter((v) => v.stock > 0);
  const [selectedVariantId, setSelectedVariantId] = useState(variantesConStock[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  const stockTotal = product.variants.reduce((acc, v) => acc + v.stock, 0);
  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);

  async function handleAddToCart() {
    if (!selectedVariantId) return;
    setLoading(true);
    setError("");
    setAdded(false);
    try {
      const { addToCart } = await import("@/lib/actions/cart");
      await addToCart(selectedVariantId, 1);
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
          <div className="thick-border pop-shadow bg-white p-3 mb-2">
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
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-black text-ajicolor-purple leading-none mb-1">{product.nombreSlug}</h1>
          <p className="text-2xl text-ajicolor-magenta italic font-medium mb-6">{product.temporada}</p>

          <p className="text-4xl font-black text-ajicolor-magenta mb-8">
            ${Number(product.precio).toLocaleString("es-CL")}
          </p>

          {variantesConStock.length > 0 ? (
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-3">Selecciona tu talla</p>
              <div className="flex gap-2 flex-wrap">
                {variantesConStock.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`w-12 h-12 flex items-center justify-center thick-border font-black text-sm ${
                      v.id === selectedVariantId ? "bg-ajicolor-ink text-white" : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    {v.talle}
                  </button>
                ))}
              </div>
              {selectedVariant && (
                <p className="text-xs text-gray-400 font-medium mt-2">
                  Color: {selectedVariant.color} · {selectedVariant.stock} disponibles
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-400 uppercase mb-8">Sin variantes disponibles</p>
          )}

          <div>
            <p className="bg-ajicolor-ink text-white px-3 py-1.5 text-xs font-bold uppercase inline-block mb-0">
              Especificación técnica
            </p>
            <div className="thick-border p-4 text-sm italic text-gray-600 font-medium">
              {product.descripcion}
              <br />
              Por {product.artista}
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-ajicolor-magenta mt-4">{error}</p>}
          {added && <p className="text-sm font-semibold text-ajicolor-green mt-4">Agregado al carrito.</p>}

          <button
            onClick={handleAddToCart}
            disabled={stockTotal === 0 || loading || !selectedVariantId}
            className="btn-block w-full justify-center py-4 mt-8 bg-ajicolor-yellow text-base disabled:opacity-40"
          >
            {stockTotal === 0 ? "Sin stock" : loading ? "Agregando..." : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </main>
  );
}
