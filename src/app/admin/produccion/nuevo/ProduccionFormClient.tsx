"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface ItemInput {
  variantId: string;
  cantidad: number;
  costoUnitario: number;
}

export default function ProduccionFormClient({
  suppliers,
  variants,
}: {
  suppliers: { id: string; nombre: string }[];
  variants: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [supplierId, setSupplierId] = useState(suppliers[0]?.id ?? "");
  const [fechaEstimada, setFechaEstimada] = useState("");
  const [items, setItems] = useState<ItemInput[]>([
    { variantId: variants[0]?.id ?? "", cantidad: 10, costoUnitario: 0 },
  ]);
  const [error, setError] = useState("");

  function addItem() {
    setItems([...items, { variantId: variants[0]?.id ?? "", cantidad: 10, costoUnitario: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof ItemInput, value: string | number) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  const totalUnidades = items.reduce((acc, i) => acc + i.cantidad, 0);
  const costoTotal = items.reduce((acc, i) => acc + i.cantidad * i.costoUnitario, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!supplierId) {
      setError("Selecciona un proveedor");
      return;
    }
    if (!fechaEstimada) {
      setError("La fecha estimada es obligatoria");
      return;
    }
    if (totalUnidades < 10) {
      setError("El lote debe tener un mínimo de 10 unidades");
      return;
    }

    try {
      const { createBatch } = await import("@/lib/actions/production");
      await createBatch({
        supplierId,
        fechaEstimada: new Date(fechaEstimada),
        items,
      });
      startTransition(() => router.push("/admin/produccion"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear el lote");
    }
  }

  if (suppliers.length === 0 || variants.length === 0) {
    return (
      <div>
        <Link href="/admin/produccion" className="text-sm text-gray-500 dark:text-neutral-400 hover:underline">
          ← Volver a Producción
        </Link>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-4">
          Necesitas al menos un proveedor y una variante de producto registrados para crear un lote.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/produccion" className="text-sm text-gray-500 dark:text-neutral-400 hover:underline">
          ← Volver a Producción
        </Link>
        <h1 className="text-2xl font-black mt-2 dark:text-neutral-100">Nuevo Lote de Producción</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-4">Información del Lote</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">Proveedor *</label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-800 dark:text-neutral-100"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">Fecha estimada *</label>
              <input
                type="date"
                value={fechaEstimada}
                onChange={(e) => setFechaEstimada(e.target.value)}
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-800 dark:text-neutral-100"
                required
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-neutral-300">Variantes del Lote</h2>
            <button
              type="button"
              onClick={addItem}
              className="px-3 py-1.5 rounded-md btn-block bg-white dark:bg-neutral-800 dark:text-neutral-100"
            >
              + Agregar variante
            </button>
          </div>
          <div className="space-y-4">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-4 gap-3 items-end">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 dark:text-neutral-400 mb-1">Variante</label>
                  <select
                    value={item.variantId}
                    onChange={(e) => updateItem(i, "variantId", e.target.value)}
                    className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-neutral-400 mb-1">Cantidad</label>
                  <input
                    type="number"
                    min={1}
                    value={item.cantidad}
                    onChange={(e) => updateItem(i, "cantidad", parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 dark:text-neutral-400 mb-1">Costo unit.</label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.costoUnitario}
                      onChange={(e) => updateItem(i, "costoUnitario", parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-800 dark:text-neutral-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="self-end px-2 py-2 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950 text-xs"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t dark:border-neutral-700 text-sm text-gray-600 dark:text-neutral-300 flex gap-6">
            <p><span className="font-medium">Total unidades:</span> {totalUnidades}</p>
            <p><span className="font-medium">Costo total:</span> ${costoTotal.toFixed(2)}</p>
          </div>
        </Card>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link href="/admin/produccion" className="px-4 py-2 rounded-md btn-block bg-white dark:bg-neutral-800 dark:text-neutral-100">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="btn-block bg-ajicolor-magenta text-white disabled:opacity-50"
          >
            {isPending ? "Creando..." : "Crear lote"}
          </button>
        </div>
      </form>
    </div>
  );
}
