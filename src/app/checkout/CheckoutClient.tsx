"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCLP } from "@/lib/format";
import type { MetodoEnvio } from "@prisma/client";

interface Item {
  id: string;
  cantidad: number;
  variant: {
    talle: string;
    color: string;
    product: { nombre: string; precio: number };
  };
}

const METODOS: { value: MetodoEnvio; label: string; costo: (correos: number) => number; nota?: string }[] = [
  { value: "CorreosSucursal", label: "Correos de Chile (a sucursal)", costo: (correos) => correos },
  { value: "StarkenPorPagar", label: "Starken (por pagar al recibir)", costo: () => 0, nota: "El costo lo cobra el transportista al momento de la entrega." },
  { value: "MetroL1", label: "Entrega en persona — Línea 1 (Manquehue a Los Héroes, desde las 18:00 hrs)", costo: () => 0 },
];

export default function CheckoutClient({
  customer,
  items,
  subtotal,
  costoEnvioCorreos,
}: {
  customer: { nombre: string; telefono: string; direccion: string };
  items: Item[];
  subtotal: number;
  costoEnvioCorreos: number;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState(customer.nombre);
  const [telefono, setTelefono] = useState(customer.telefono);
  const [calle, setCalle] = useState(customer.direccion);
  const [numero, setNumero] = useState("");
  const [comuna, setComuna] = useState("");
  const [region, setRegion] = useState("");
  const [metodoEnvio, setMetodoEnvio] = useState<MetodoEnvio>("CorreosSucursal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const metodoSeleccionado = METODOS.find((m) => m.value === metodoEnvio)!;
  const costoEnvio = metodoSeleccionado.costo(costoEnvioCorreos);
  const total = subtotal + costoEnvio;

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
      const order = await checkout({ nombre, telefono, calle, numero, comuna, region, metodoEnvio });
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
            <label htmlFor="chk-nombre" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Nombre completo</label>
            <input
              id="chk-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="chk-telefono" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Teléfono</label>
            <input
              id="chk-telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="chk-calle" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Calle</label>
            <input
              id="chk-calle"
              value={calle}
              onChange={(e) => setCalle(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="chk-numero" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Número / Depto</label>
            <input
              id="chk-numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="chk-comuna" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Comuna</label>
            <input
              id="chk-comuna"
              value={comuna}
              onChange={(e) => setComuna(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="chk-region" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Región</label>
            <input
              id="chk-region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6">
        <h2 className="font-black uppercase text-sm mb-4">Método de envío</h2>
        <div className="space-y-2">
          {METODOS.map((m) => (
            <label
              key={m.value}
              className={`flex items-start gap-3 p-3 rounded-md border-2 cursor-pointer ${
                metodoEnvio === m.value ? "border-ajicolor-magenta" : "border-gray-200 dark:border-neutral-700"
              }`}
            >
              <input
                type="radio"
                name="metodoEnvio"
                checked={metodoEnvio === m.value}
                onChange={() => setMetodoEnvio(m.value)}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="flex justify-between text-sm font-medium">
                  <span>{m.label}</span>
                  <span>{m.costo(costoEnvioCorreos) > 0 ? formatCLP(m.costo(costoEnvioCorreos)) : "Ver detalle"}</span>
                </div>
                {m.nota && <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{m.nota}</p>}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6">
        <h2 className="font-black uppercase text-sm mb-4">Resumen</h2>
        <div className="space-y-2 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-gray-600 dark:text-neutral-300">
              <span>
                {item.variant.product.nombre} ({item.variant.talle}/{item.variant.color}) ×{item.cantidad}
              </span>
              <span>{formatCLP(item.variant.product.precio * item.cantidad)}</span>
            </div>
          ))}
        </div>
        <div className="h-px bg-gray-200 dark:bg-neutral-700 my-4" />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-gray-600 dark:text-neutral-300">
            <span>Subtotal</span>
            <span>{formatCLP(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600 dark:text-neutral-300">
            <span>Envío</span>
            <span>{costoEnvio > 0 ? formatCLP(costoEnvio) : "Por pagar"}</span>
          </div>
          <div className="flex justify-between font-black text-lg text-ajicolor-magenta pt-2">
            <span>Total</span>
            <span>{formatCLP(total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-ajicolor-yellow/30 border-2 border-ajicolor-yellow rounded-md p-4 text-sm">
        Todas nuestras poleras son 100% serigrafía, hechas por encargo. El plazo de producción es de
        5 a 7 días hábiles desde que confirmamos tu pago.
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
