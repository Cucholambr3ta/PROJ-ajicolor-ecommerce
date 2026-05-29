"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Variant {
  id: string;
  product: { nombreSlug: string };
  talle: string;
  color: string;
  sku: string;
  stock: number;
  stockMin: number;
}

export default function StockPageClient({ variants }: { variants: Variant[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<{ open: boolean; variant?: Variant }>({ open: false });
  const [tipo, setTipo] = useState<"Entrada" | "Salida" | "Ajuste">("Entrada");
  const [cantidad, setCantidad] = useState(1);
  const [origen, setOrigen] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!modal.variant) return;
    setError("");

    const { adjustStock } = await import("@/lib/actions/stock");
    try {
      const ajuste = tipo === "Salida" ? -cantidad : cantidad;
      await adjustStock(modal.variant.id, ajuste, tipo, origen, descripcion || undefined);
      setModal({ open: false });
      setCantidad(1);
      setOrigen("");
      setDescripcion("");
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al ajustar stock");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventario</h1>
      </div>
      <Card>
        {variants.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay stock para mostrar.</div>
        ) : (
          <div className="divide-y">
            {variants.map((v) => (
              <div key={v.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{v.product.nombreSlug}</p>
                  <p className="text-sm text-gray-500">
                    {v.talle} / {v.color} — SKU: {v.sku}
                  </p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="font-bold">{v.stock} u.</span>
                    {v.stock <= v.stockMin && (
                      <Badge variant="destructive" className="ml-2">Bajo</Badge>
                    )}
                  </div>
                  <button
                    onClick={() => setModal({ open: true, variant: v })}
                    className="px-3 py-1.5 rounded-md bg-ajicolor-magenta text-white text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    Ajustar stock
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {modal.open && modal.variant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">Ajustar Stock</h2>
            <p className="text-sm text-gray-500 mb-4">
              {modal.variant.product.nombreSlug} — {modal.variant.talle} / {modal.variant.color}
              <br />
              Stock actual: <span className="font-bold">{modal.variant.stock}</span> u.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as typeof tipo)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="Entrada">Entrada</option>
                  <option value="Salida">Salida</option>
                  <option value="Ajuste">Ajuste</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
                <input
                  type="text"
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  placeholder="Ej: Recepción de lote, Devolución..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setModal({ open: false }); setError(""); }}
                  className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isPending ? "Guardando..." : "Aplicar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
