"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

interface LineaCompra {
  color: string;
  talla: string;
  cantidad: number;
  costoUnitario: number;
}

const MENSAJE_DEFAULT = "Hola! Les hago el siguiente pedido de poleras:";

/** Normaliza un teléfono a dígitos puros con código de país, como exige el
 * link wa.me (sin +, espacios ni guiones). */
function normalizarTelefono(telefono: string): string {
  return telefono.replace(/[^0-9]/g, "");
}

export default function CompraWhatsAppClient({
  supplierId,
  supplierNombre,
  telefono,
  leadTimeDias,
}: {
  supplierId: string;
  supplierNombre: string;
  telefono: string | null;
  leadTimeDias: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [color, setColor] = useState("");
  const [talla, setTalla] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [costoUnitario, setCostoUnitario] = useState(0);
  const [lineas, setLineas] = useState<LineaCompra[]>([]);
  const [mensajeHeader, setMensajeHeader] = useState(MENSAJE_DEFAULT);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  function agregarLinea() {
    if (!color.trim() || !talla.trim() || cantidad < 1) {
      setError("Completa color, talla y cantidad antes de agregar");
      return;
    }
    setError("");
    setLineas((prev) => [...prev, { color: color.trim(), talla: talla.trim(), cantidad, costoUnitario }]);
    setColor("");
    setTalla("");
    setCantidad(1);
    setCostoUnitario(0);
  }

  function quitarLinea(index: number) {
    setLineas((prev) => prev.filter((_, i) => i !== index));
  }

  const costoTotal = lineas.reduce((acc, l) => acc + l.cantidad * l.costoUnitario, 0);
  const unidadesTotales = lineas.reduce((acc, l) => acc + l.cantidad, 0);

  function construirMensaje(): string {
    const detalle = lineas
      .map((l) => `• ${l.color} / ${l.talla} — ${l.cantidad} u.`)
      .join("\n");
    return `${mensajeHeader}\n\n${detalle}\n\nTotal: ${unidadesTotales} unidades`;
  }

  async function handleRealizarCompra() {
    if (lineas.length === 0) {
      setError("Agrega al menos una línea antes de realizar la compra");
      return;
    }
    if (!telefono) {
      setError("Este proveedor no tiene WhatsApp cargado — agrégalo en Editar antes de comprar");
      return;
    }

    setError("");
    setEnviando(true);
    try {
      const mensaje = construirMensaje();
      const fechaEstimada = new Date(Date.now() + leadTimeDias * 24 * 60 * 60 * 1000);

      const { createBatch } = await import("@/lib/actions/production");
      await createBatch({
        supplierId,
        fechaEstimada,
        mensajeWhatsapp: mensaje,
        items: lineas.map((l) => ({
          colorLibre: l.color,
          tallaLibre: l.talla,
          cantidad: l.cantidad,
          costoUnitario: l.costoUnitario,
        })),
      });

      const numero = normalizarTelefono(telefono);
      const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, "_blank", "noopener,noreferrer");

      setLineas([]);
      setMensajeHeader(MENSAJE_DEFAULT);
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al realizar la compra");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Card className="p-6 mb-6">
      <h2 className="font-semibold text-gray-700 dark:text-neutral-200 mb-1">Comprar poleras a {supplierNombre}</h2>
      <p className="text-xs text-gray-400 dark:text-neutral-500 mb-4">
        Arma el pedido por color y talla — al realizar la compra se crea el lote de producción y se abre WhatsApp con el mensaje armado.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Color</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="Negro"
            className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Talla</label>
          <input
            type="text"
            value={talla}
            onChange={(e) => setTalla(e.target.value)}
            placeholder="M"
            className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Cantidad</label>
          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
            className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Costo unit.</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={costoUnitario}
            onChange={(e) => setCostoUnitario(parseFloat(e.target.value) || 0)}
            className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <button
          type="button"
          onClick={agregarLinea}
          className="px-3 py-2 rounded-md btn-block bg-white dark:bg-neutral-900"
        >
          + Agregar
        </button>
      </div>

      {lineas.length > 0 && (
        <div className="mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
                <th className="pb-2">Color</th>
                <th className="pb-2">Talla</th>
                <th className="pb-2 text-right">Cantidad</th>
                <th className="pb-2 text-right">Costo unit.</th>
                <th className="pb-2 text-right">Subtotal</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {lineas.map((l, i) => (
                <tr key={i} className="border-b last:border-0 dark:border-neutral-700">
                  <td className="py-2">{l.color}</td>
                  <td className="py-2">{l.talla}</td>
                  <td className="py-2 text-right">{l.cantidad}</td>
                  <td className="py-2 text-right">${l.costoUnitario.toLocaleString("es-CL")}</td>
                  <td className="py-2 text-right font-medium">
                    ${(l.cantidad * l.costoUnitario).toLocaleString("es-CL")}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => quitarLinea(i)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-2 py-1 text-xs"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-right text-sm font-bold mt-2">
            Total: {unidadesTotales} u. — ${costoTotal.toLocaleString("es-CL")}
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">
          Encabezado del mensaje de WhatsApp
        </label>
        <textarea
          value={mensajeHeader}
          onChange={(e) => setMensajeHeader(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
        />
      </div>

      {lineas.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-neutral-800 rounded-md text-xs whitespace-pre-wrap text-gray-600 dark:text-neutral-300">
          {construirMensaje()}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-3 dark:text-red-400">{error}</p>}

      <button
        type="button"
        onClick={handleRealizarCompra}
        disabled={enviando || isPending || lineas.length === 0}
        className="btn-block bg-ajicolor-green text-white disabled:opacity-40"
      >
        {enviando ? "Creando lote..." : "Realizar compra"}
      </button>
    </Card>
  );
}
