"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Material {
  id: string;
  nombre: string;
  unidad: string;
  stock: number;
  costo: number;
  supplier: { nombre: string } | null;
  _count: { movements: number };
}

interface Movement {
  id: string;
  cantidad: number;
  tipo: string;
  origen: string;
  descripcion: string | null;
  costoTotal: number | null;
  createdAt: Date;
}

interface GastoProveedor {
  proveedor: string;
  total: number;
  compras: number;
}

export default function InsumosPageClient({
  materials,
  suppliers,
  gastoPorProveedor,
}: {
  materials: Material[];
  suppliers: { id: string; nombre: string }[];
  gastoPorProveedor: { porProveedor: GastoProveedor[]; totalGeneral: number };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("");
  const [costo, setCosto] = useState(0);
  const [supplierId, setSupplierId] = useState("");

  const [movModal, setMovModal] = useState<{ open: boolean; materialId?: string; materialNombre?: string }>({ open: false });
  const [movTipo, setMovTipo] = useState<"Entrada" | "Salida" | "Ajuste">("Entrada");
  const [movCantidad, setMovCantidad] = useState(1);
  const [movOrigen, setMovOrigen] = useState("");
  const [movCostoTotal, setMovCostoTotal] = useState<number | "">("");
  const [movError, setMovError] = useState("");

  const [historyFor, setHistoryFor] = useState<string | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { createMaterial } = await import("@/lib/actions/materials");
      await createMaterial({ nombre, unidad, costo, supplierId: supplierId || undefined });
      setShowForm(false);
      setNombre("");
      setUnidad("");
      setCosto(0);
      setSupplierId("");
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear el insumo");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este insumo?")) return;
    try {
      const { deleteMaterial } = await import("@/lib/actions/materials");
      await deleteMaterial(id);
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error al eliminar");
    }
  }

  async function handleMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!movModal.materialId) return;
    setMovError("");
    try {
      const { createMaterialMovement } = await import("@/lib/actions/materials");
      await createMaterialMovement({
        materialId: movModal.materialId,
        cantidad: movCantidad,
        tipo: movTipo,
        origen: movOrigen,
        costoTotal: movTipo === "Entrada" && movCostoTotal !== "" ? movCostoTotal : undefined,
      });
      setMovModal({ open: false });
      setMovCantidad(1);
      setMovOrigen("");
      setMovCostoTotal("");
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setMovError(err instanceof Error ? err.message : "Error al registrar el movimiento");
    }
  }

  async function handleShowHistory(materialId: string) {
    if (historyFor === materialId) {
      setHistoryFor(null);
      return;
    }
    setHistoryFor(materialId);
    setLoadingHistory(true);
    const { getMaterialMovements } = await import("@/lib/actions/materials");
    const data = await getMaterialMovements(materialId);
    setMovements(data);
    setLoadingHistory(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Insumos</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90"
        >
          {showForm ? "Cancelar" : "+ Nuevo insumo"}
        </button>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-bold mb-4">Gasto en compras por proveedor</h2>
        {gastoPorProveedor.porProveedor.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Todavía no hay compras registradas con costo (DTF, tintas, poleras, etc.). Registra el costo al crear un movimiento de Entrada para que aparezca acá.
          </p>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {gastoPorProveedor.porProveedor.map((p) => (
                <div key={p.proveedor} className="flex items-center justify-between text-sm">
                  <span>
                    {p.proveedor} <span className="text-gray-400 dark:text-neutral-500">({p.compras} compra{p.compras !== 1 ? "s" : ""})</span>
                  </span>
                  <span className="font-bold">${p.total.toLocaleString("es-CL")}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between text-sm font-black border-t border-gray-200 dark:border-neutral-700 pt-3">
              <span>Total general</span>
              <span>${gastoPorProveedor.totalGeneral.toLocaleString("es-CL")}</span>
            </div>
          </>
        )}
      </Card>

      {showForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Nombre *</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                placeholder="Ej: Polera lisa blanca"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Unidad *</label>
              <input
                value={unidad}
                onChange={(e) => setUnidad(e.target.value)}
                required
                placeholder="unidad, metro, litro, kg"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Costo unitario</label>
              <input
                type="number"
                min={0}
                value={costo}
                onChange={(e) => setCosto(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Proveedor</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              >
                <option value="">—</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4 flex justify-end">
              <button type="submit" className="btn-block bg-ajicolor-magenta text-white px-6">
                Crear insumo
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </Card>
      )}

      <Card>
        {materials.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-neutral-400">No hay insumos registrados.</div>
        ) : (
          <div className="divide-y">
            {materials.map((m) => (
              <div key={m.id}>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{m.nombre}</p>
                    <p className="text-sm text-gray-500 dark:text-neutral-400">
                      {m.supplier?.nombre ?? "Sin proveedor"} · ${m.costo.toLocaleString("es-CL")}/{m.unidad}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">
                      {m.stock} {m.unidad}
                    </span>
                    {m.stock <= 0 && <Badge variant="destructive">Sin stock</Badge>}
                    <button
                      onClick={() => handleShowHistory(m.id)}
                      className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-neutral-700 text-xs font-medium hover:bg-gray-50 dark:hover:bg-neutral-800"
                    >
                      {historyFor === m.id ? "Ocultar" : "Historial"}
                    </button>
                    <button
                      onClick={() => setMovModal({ open: true, materialId: m.id, materialNombre: m.nombre })}
                      className="px-3 py-1.5 rounded-md bg-ajicolor-purple text-white text-xs font-medium hover:opacity-90"
                    >
                      Movimiento
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      disabled={m._count.movements > 0}
                      title={m._count.movements > 0 ? "No se puede eliminar: tiene movimientos" : undefined}
                      className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-40"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
                {historyFor === m.id && (
                  <div className="px-4 pb-4">
                    {loadingHistory ? (
                      <p className="text-xs text-gray-400">Cargando...</p>
                    ) : movements.length === 0 ? (
                      <p className="text-xs text-gray-400">Sin movimientos registrados.</p>
                    ) : (
                      <table className="w-full text-xs bg-gray-50 dark:bg-neutral-800 rounded-md">
                        <thead>
                          <tr className="text-left text-gray-500 dark:text-neutral-400">
                            <th className="p-2">Fecha</th>
                            <th className="p-2">Tipo</th>
                            <th className="p-2 text-right">Cantidad</th>
                            <th className="p-2">Origen</th>
                            <th className="p-2 text-right">Costo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {movements.map((mv) => (
                            <tr key={mv.id} className="border-t border-gray-200 dark:border-neutral-700">
                              <td className="p-2">{new Date(mv.createdAt).toLocaleDateString("es-CL")}</td>
                              <td className="p-2">{mv.tipo}</td>
                              <td className="p-2 text-right font-mono">{mv.cantidad > 0 ? `+${mv.cantidad}` : mv.cantidad}</td>
                              <td className="p-2">{mv.origen}</td>
                              <td className="p-2 text-right">{mv.costoTotal != null ? `$${mv.costoTotal.toLocaleString("es-CL")}` : "—"}</td>
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

      {movModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-4">Movimiento — {movModal.materialNombre}</h2>
            <form onSubmit={handleMovement} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  value={movTipo}
                  onChange={(e) => setMovTipo(e.target.value as typeof movTipo)}
                  className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                >
                  <option value="Entrada">Entrada</option>
                  <option value="Salida">Salida</option>
                  <option value="Ajuste">Ajuste</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  value={movCantidad}
                  onChange={(e) => setMovCantidad(Number(e.target.value) || 1)}
                  className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Origen</label>
                <input
                  value={movOrigen}
                  onChange={(e) => setMovOrigen(e.target.value)}
                  required
                  placeholder="Ej: Compra a proveedor, Consumo en lote..."
                  className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                />
              </div>
              {movTipo === "Entrada" && (
                <div>
                  <label className="block text-sm font-medium mb-1">Costo total pagado (opcional)</label>
                  <input
                    type="number"
                    min={0}
                    value={movCostoTotal}
                    onChange={(e) => setMovCostoTotal(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="Ej: 45000"
                    className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                  />
                  <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
                    Para llevar el control de gasto por proveedor. Déjalo vacío si no corresponde a una compra.
                  </p>
                </div>
              )}
              {movError && <p className="text-red-500 text-sm">{movError}</p>}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setMovModal({ open: false }); setMovError(""); }}
                  className="px-4 py-2 rounded-md btn-block bg-white dark:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="btn-block bg-ajicolor-magenta text-white disabled:opacity-50">
                  {isPending ? "Guardando..." : "Aplicar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
