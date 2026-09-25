"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Variant {
  id: string;
  product: { nombre: string };
  talle: string;
  color: string;
  sku: string;
  stock: number;
  stockMin: number;
}

interface Movement {
  id: string;
  cantidad: number;
  tipo: string;
  origen: string;
  descripcion: string | null;
  createdAt: Date;
  user: { email: string } | null;
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
  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  async function handleShowHistory(variantId: string) {
    if (historyFor === variantId) {
      setHistoryFor(null);
      return;
    }
    setHistoryFor(variantId);
    setLoadingHistory(true);
    const { getStockMovements } = await import("@/lib/actions/stock");
    const data = await getStockMovements(variantId);
    setMovements(data);
    setLoadingHistory(false);
  }

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
        <h1 className="text-2xl font-black">Inventario</h1>
      </div>
      <Card>
        {variants.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-neutral-400">No hay stock para mostrar.</div>
        ) : (
          <div className="divide-y">
            {variants.map((v) => (
              <div key={v.id}>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{v.product.nombre}</p>
                    <p className="text-sm text-gray-500 dark:text-neutral-400">
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
                      onClick={() => handleShowHistory(v.id)}
                      className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-neutral-700 text-xs font-medium hover:bg-gray-50 dark:hover:bg-neutral-800"
                    >
                      {historyFor === v.id ? "Ocultar historial" : "Ver historial"}
                    </button>
                    <button
                      onClick={() => setModal({ open: true, variant: v })}
                      className="px-3 py-1.5 rounded-md bg-ajicolor-magenta text-white text-xs font-medium hover:opacity-90 transition-opacity"
                    >
                      Ajustar stock
                    </button>
                  </div>
                </div>
                {historyFor === v.id && (
                  <div className="px-4 pb-4">
                    {loadingHistory ? (
                      <p className="text-xs text-gray-400 dark:text-neutral-500">Cargando...</p>
                    ) : movements.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-neutral-500">Sin movimientos registrados.</p>
                    ) : (
                      <table className="w-full text-xs bg-gray-50 dark:bg-neutral-800 rounded-md">
                        <thead>
                          <tr className="text-left text-gray-500 dark:text-neutral-400">
                            <th className="p-2">Fecha</th>
                            <th className="p-2">Tipo</th>
                            <th className="p-2 text-right">Cantidad</th>
                            <th className="p-2">Origen</th>
                            <th className="p-2">Usuario</th>
                          </tr>
                        </thead>
                        <tbody>
                          {movements.map((m) => (
                            <tr key={m.id} className="border-t border-gray-200 dark:border-neutral-700">
                              <td className="p-2">{new Date(m.createdAt).toLocaleDateString("es-CL")}</td>
                              <td className="p-2">{m.tipo}</td>
                              <td className="p-2 text-right font-mono">{m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}</td>
                              <td className="p-2">{m.origen}</td>
                              <td className="p-2 text-gray-500 dark:text-neutral-400">{m.user?.email ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {modal.open && modal.variant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">Ajustar Stock</h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
              {modal.variant.product.nombre} — {modal.variant.talle} / {modal.variant.color}
              <br />
              Stock actual: <span className="font-bold">{modal.variant.stock}</span> u.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">Tipo</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as typeof tipo)}
                  className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                >
                  <option value="Entrada">Entrada</option>
                  <option value="Salida">Salida</option>
                  <option value="Ajuste">Ajuste</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={cantidad}
                  onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">Origen</label>
                <input
                  type="text"
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value)}
                  placeholder="Ej: Recepción de lote, Devolución..."
                  className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">Descripción (opcional)</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setModal({ open: false }); setError(""); }}
                  className="px-4 py-2 rounded-md btn-block bg-white dark:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-block bg-ajicolor-magenta text-white disabled:opacity-50"
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
