"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Coupon {
  id: string;
  codigo: string;
  tipo: string;
  valor: number;
  montoMinimo: number | null;
  usosMaximos: number | null;
  usosActuales: number;
  vigenteHasta: Date | null;
  activo: boolean;
  _count: { orders: number };
}

const TIPO_LABELS: Record<string, string> = {
  porcentaje: "% descuento",
  monto: "Monto fijo",
  envio_gratis: "Envío gratis",
};

export default function CuponesPageClient({ cupones }: { cupones: Coupon[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState<"porcentaje" | "monto" | "envio_gratis">("porcentaje");
  const [valor, setValor] = useState(10);
  const [montoMinimo, setMontoMinimo] = useState("");
  const [usosMaximos, setUsosMaximos] = useState("");
  const [vigenteHasta, setVigenteHasta] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { createCoupon } = await import("@/lib/actions/coupons-admin");
      await createCoupon({
        codigo,
        tipo,
        valor: tipo === "envio_gratis" ? 0 : valor,
        montoMinimo: montoMinimo ? Number(montoMinimo) : undefined,
        usosMaximos: usosMaximos ? Number(usosMaximos) : undefined,
        vigenteHasta: vigenteHasta ? new Date(vigenteHasta) : undefined,
      });
      setShowForm(false);
      setCodigo("");
      setValor(10);
      setMontoMinimo("");
      setUsosMaximos("");
      setVigenteHasta("");
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear el cupón");
    }
  }

  async function handleToggleActive(id: string, activo: boolean) {
    const { updateCoupon } = await import("@/lib/actions/coupons-admin");
    await updateCoupon(id, { activo: !activo });
    startTransition(() => router.refresh());
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este cupón?")) return;
    const { deleteCoupon } = await import("@/lib/actions/coupons-admin");
    await deleteCoupon(id);
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Cupones</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {showForm ? "Cancelar" : "+ Nuevo cupón"}
        </button>
      </div>

      {showForm && (
        <Card className="p-6 mb-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Código *</label>
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Tipo</label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value as typeof tipo)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              >
                <option value="porcentaje">% descuento</option>
                <option value="monto">Monto fijo</option>
                <option value="envio_gratis">Envío gratis</option>
              </select>
            </div>
            {tipo !== "envio_gratis" && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">
                  Valor {tipo === "porcentaje" ? "(%)" : "($)"}
                </label>
                <input
                  type="number"
                  min={0}
                  value={valor}
                  onChange={(e) => setValor(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Monto mínimo (opcional)</label>
              <input
                type="number"
                min={0}
                value={montoMinimo}
                onChange={(e) => setMontoMinimo(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Usos máximos (opcional)</label>
              <input
                type="number"
                min={1}
                value={usosMaximos}
                onChange={(e) => setUsosMaximos(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Vigente hasta (opcional)</label>
              <input
                type="date"
                value={vigenteHasta}
                onChange={(e) => setVigenteHasta(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button type="submit" className="btn-block bg-ajicolor-magenta text-white px-6">
                Crear cupón
              </button>
            </div>
          </form>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </Card>
      )}

      <Card>
        {cupones.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-neutral-400">No hay cupones registrados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 dark:text-neutral-400 dark:border-neutral-700">
                <th className="p-4 pb-2">Código</th>
                <th className="p-4 pb-2">Tipo</th>
                <th className="p-4 pb-2 text-right">Valor</th>
                <th className="p-4 pb-2 text-center">Usos</th>
                <th className="p-4 pb-2">Vigencia</th>
                <th className="p-4 pb-2 text-center">Estado</th>
                <th className="p-4 pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cupones.map((c) => (
                <tr key={c.id} className="border-b last:border-0 dark:border-neutral-700">
                  <td className="p-4 font-mono font-bold">{c.codigo}</td>
                  <td className="p-4">{TIPO_LABELS[c.tipo] ?? c.tipo}</td>
                  <td className="p-4 text-right">
                    {c.tipo === "porcentaje" ? `${c.valor}%` : c.tipo === "monto" ? `$${c.valor.toLocaleString("es-CL")}` : "—"}
                  </td>
                  <td className="p-4 text-center">
                    {c.usosActuales}
                    {c.usosMaximos ? ` / ${c.usosMaximos}` : ""}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-neutral-300">
                    {c.vigenteHasta ? new Date(c.vigenteHasta).toLocaleDateString("es-CL") : "Sin límite"}
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={c.activo ? "default" : "outline"}>{c.activo ? "Activo" : "Inactivo"}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleToggleActive(c.id, c.activo)}
                        disabled={isPending}
                        className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-neutral-700 text-xs font-medium hover:bg-gray-50 dark:hover:bg-neutral-800"
                      >
                        {c.activo ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={isPending || c._count.orders > 0}
                        title={c._count.orders > 0 ? "No se puede eliminar: tiene pedidos asociados" : undefined}
                        className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
