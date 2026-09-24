"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface ItemInput {
  variantId: string;
  cantidad: number;
  precioUnit: number;
}

const CANALES = ["Instagram", "WhatsApp", "Feria", "Tienda"];

export default function PedidoFormClient({
  customers,
  variants,
}: {
  customers: { id: string; nombre: string; email: string }[];
  variants: { id: string; label: string; precio: number; stock: number }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [canal, setCanal] = useState(CANALES[0]);
  const [notas, setNotas] = useState("");
  const [items, setItems] = useState<ItemInput[]>([
    { variantId: variants[0]?.id ?? "", cantidad: 1, precioUnit: variants[0]?.precio ?? 0 },
  ]);
  const [error, setError] = useState("");

  function addItem() {
    setItems([...items, { variantId: variants[0]?.id ?? "", cantidad: 1, precioUnit: variants[0]?.precio ?? 0 }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof ItemInput, value: string | number) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    if (field === "variantId") {
      const variant = variants.find((v) => v.id === value);
      if (variant) updated[index].precioUnit = variant.precio;
    }
    setItems(updated);
  }

  const total = items.reduce((acc, i) => acc + i.cantidad * i.precioUnit, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!customerId) {
      setError("Selecciona un cliente");
      return;
    }

    try {
      const { createOrder } = await import("@/lib/actions/orders");
      const order = await createOrder({ customerId, canal, notas: notas || undefined, items });
      startTransition(() => router.push(`/admin/pedidos/${order.id}`));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear el pedido");
    }
  }

  if (customers.length === 0 || variants.length === 0) {
    return (
      <div>
        <Link href="/admin/pedidos" className="text-sm text-gray-500 dark:text-neutral-400 hover:underline">
          ← Volver a Pedidos
        </Link>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-4">
          Necesitas al menos un cliente y una variante de producto registrados para crear un pedido.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/pedidos" className="text-sm text-gray-500 dark:text-neutral-400 hover:underline">
          ← Volver a Pedidos
        </Link>
        <h1 className="text-2xl font-black mt-2 dark:text-neutral-100">Nuevo Pedido (venta manual)</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-4">Información del Pedido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">Cliente *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-800 dark:text-neutral-100"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre} ({c.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">Canal *</label>
              <select
                value={canal}
                onChange={(e) => setCanal(e.target.value)}
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-800 dark:text-neutral-100"
              >
                {CANALES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">Notas</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-neutral-300">Items</h2>
            <button type="button" onClick={addItem} className="px-3 py-1.5 rounded-md btn-block bg-white dark:bg-neutral-800 dark:text-neutral-100">
              + Agregar item
            </button>
          </div>
          <div className="space-y-4">
            {items.map((item, i) => {
              const variant = variants.find((v) => v.id === item.variantId);
              return (
                <div key={i} className="grid grid-cols-4 gap-3 items-end">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 dark:text-neutral-400 mb-1">
                      Variante {variant && `(stock: ${variant.stock})`}
                    </label>
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
                      <label className="block text-xs text-gray-500 dark:text-neutral-400 mb-1">Precio unit.</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.precioUnit}
                        onChange={(e) => updateItem(i, "precioUnit", parseFloat(e.target.value) || 0)}
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
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t dark:border-neutral-700 text-sm text-gray-600 dark:text-neutral-300">
            <p><span className="font-medium">Total:</span> ${total.toFixed(2)}</p>
          </div>
        </Card>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link href="/admin/pedidos" className="px-4 py-2 rounded-md btn-block bg-white dark:bg-neutral-800 dark:text-neutral-100">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="btn-block bg-ajicolor-magenta text-white disabled:opacity-50"
          >
            {isPending ? "Creando..." : "Crear pedido"}
          </button>
        </div>
      </form>
    </div>
  );
}
