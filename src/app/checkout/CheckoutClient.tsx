"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const COSTO_ENVIO = 5000;

interface Item {
  id: string;
  cantidad: number;
  variant: {
    talle: string;
    color: string;
    product: { nombreSlug: string; precio: number };
  };
}

export default function CheckoutClient({
  customer,
  items,
  subtotal,
}: {
  customer: { nombre: string; telefono: string; direccion: string };
  items: Item[];
  subtotal: number;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState(customer.nombre);
  const [telefono, setTelefono] = useState(customer.telefono);
  const [calle, setCalle] = useState(customer.direccion);
  const [numero, setNumero] = useState("");
  const [comuna, setComuna] = useState("");
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = subtotal + COSTO_ENVIO;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !telefono.trim() || !calle.trim() || !numero.trim() || !comuna.trim() || !region.trim()) {
      setError("Todos los campos de dirección son obligatorios");
      return;
    }

    setLoading(true);
    try {
      const { checkout } = await import("@/lib/actions/cart");
      const order = await checkout({ nombre, telefono, calle, numero, comuna, region });
      router.push(`/pedido/${order.numero}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al confirmar el pedido");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6">
        <h2 className="font-black uppercase text-sm mb-4">Dirección de envío</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Nombre completo</label>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Teléfono</label>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Calle</label>
            <input
              value={calle}
              onChange={(e) => setCalle(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Número / Depto</label>
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Comuna</label>
            <input
              value={comuna}
              onChange={(e) => setComuna(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Región</label>
            <input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6">
        <h2 className="font-black uppercase text-sm mb-4">Resumen</h2>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-gray-600 dark:text-neutral-300">
              <span>
                {item.variant.product.nombreSlug} ({item.variant.talle}/{item.variant.color}) ×{item.cantidad}
              </span>
              <span>${(item.variant.product.precio * item.cantidad).toLocaleString("es-CL")}</span>
            </div>
          ))}
        </div>
        <div className="h-px bg-gray-200 dark:bg-neutral-700 my-4" />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-neutral-300">
            <span>Subtotal</span>
            <span>${subtotal.toLocaleString("es-CL")}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-neutral-300">
            <span>Envío</span>
            <span>${COSTO_ENVIO.toLocaleString("es-CL")}</span>
          </div>
          <div className="flex justify-between font-black text-lg text-ajicolor-magenta pt-2">
            <span>Total</span>
            <span>${total.toLocaleString("es-CL")}</span>
          </div>
        </div>
      </div>

      {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-block w-full bg-ajicolor-green text-white justify-center py-4 text-base disabled:opacity-50"
      >
        {loading ? "Procesando..." : "Confirmar pedido"}
      </button>
    </form>
  );
}
