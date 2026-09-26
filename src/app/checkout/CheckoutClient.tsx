"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCLP } from "@/lib/format";
import { REGIONES, comunasDe } from "@/lib/chile";
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

interface SavedAddress {
  id: string;
  etiqueta: string | null;
  nombre: string;
  telefono: string;
  calle: string;
  numero: string;
  comuna: string;
  region: string;
}

const METODOS: { value: MetodoEnvio; label: string; costo: (correos: number) => number; nota?: string }[] = [
  { value: "CorreosSucursal", label: "Correos de Chile (a sucursal)", costo: (correos) => correos },
  { value: "StarkenPorPagar", label: "Starken (por pagar al recibir)", costo: () => 0, nota: "El costo lo cobra el transportista al momento de la entrega." },
  { value: "MetroL1", label: "Entrega en persona — Línea 1 (Manquehue a Los Héroes, desde las 18:00 hrs)", costo: () => 0 },
];

export default function CheckoutClient({
  customer,
  addresses,
  items,
  subtotal,
  costoEnvioCorreos,
  whatsapp,
}: {
  customer: { nombre: string; telefono: string; direccion: string };
  addresses: SavedAddress[];
  items: Item[];
  subtotal: number;
  costoEnvioCorreos: number;
  whatsapp: string | null;
}) {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id ?? "nueva");
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const [nombre, setNombre] = useState(selectedAddress?.nombre ?? customer.nombre);
  const [telefono, setTelefono] = useState(selectedAddress?.telefono ?? customer.telefono);
  const [calle, setCalle] = useState(selectedAddress?.calle ?? customer.direccion);
  const [numero, setNumero] = useState(selectedAddress?.numero ?? "");
  const [comuna, setComuna] = useState(selectedAddress?.comuna ?? "");
  const [region, setRegion] = useState(selectedAddress?.region ?? "");
  const [metodoEnvio, setMetodoEnvio] = useState<MetodoEnvio>("CorreosSucursal");
  const [notas, setNotas] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ codigo: string; tipo: string; descuento: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  function handleSelectAddress(id: string) {
    setSelectedAddressId(id);
    if (id === "nueva") {
      setNombre(customer.nombre);
      setTelefono(customer.telefono);
      setCalle(customer.direccion);
      setNumero("");
      setComuna("");
      setRegion("");
      return;
    }
    const addr = addresses.find((a) => a.id === id);
    if (addr) {
      setNombre(addr.nombre);
      setTelefono(addr.telefono);
      setCalle(addr.calle);
      setNumero(addr.numero);
      setComuna(addr.comuna);
      setRegion(addr.region);
    }
  }

  async function handleApplyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    const { validateCoupon } = await import("@/lib/actions/coupons");
    const result = await validateCoupon(couponInput, subtotal);
    setCouponLoading(false);
    if (!result.ok) {
      setCouponError(result.error);
      setCoupon(null);
      return;
    }
    setCoupon({ codigo: result.data.codigo, tipo: result.data.tipo, descuento: result.data.descuento });
  }

  const metodoSeleccionado = METODOS.find((m) => m.value === metodoEnvio)!;
  const costoEnvioBase = metodoSeleccionado.costo(costoEnvioCorreos);
  const costoEnvio = coupon?.tipo === "envio_gratis" ? 0 : costoEnvioBase;
  const descuento = coupon?.tipo === "envio_gratis" ? 0 : (coupon?.descuento ?? 0);
  const total = Math.max(0, subtotal - descuento + costoEnvio);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !telefono.trim() || !calle.trim() || !numero.trim() || !comuna.trim() || !region.trim()) {
      setError("Todos los campos de dirección son obligatorios");
      return;
    }
    if (!aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones para continuar");
      return;
    }

    setLoading(true);
    try {
      const { checkout } = await import("@/lib/actions/cart");
      const order = await checkout({
        nombre,
        telefono,
        calle,
        numero,
        comuna,
        region,
        metodoEnvio,
        couponCode: coupon?.codigo,
        notas: notas.trim() || undefined,
      });
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

        {addresses.length > 0 && (
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-2">
              Usar una dirección guardada
            </label>
            <select
              value={selectedAddressId}
              onChange={(e) => handleSelectAddress(e.target.value)}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
            >
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.etiqueta || "Dirección"} — {a.calle} {a.numero}, {a.comuna}
                </option>
              ))}
              <option value="nueva">Usar una dirección nueva</option>
            </select>
          </div>
        )}

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
            <label htmlFor="chk-region" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Región</label>
            <select
              id="chk-region"
              value={region}
              onChange={(e) => {
                setRegion(e.target.value);
                setComuna("");
              }}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900"
            >
              <option value="">Selecciona una región</option>
              {REGIONES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="chk-comuna" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">Comuna</label>
            <select
              id="chk-comuna"
              value={comuna}
              onChange={(e) => setComuna(e.target.value)}
              disabled={!region}
              className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm bg-white dark:bg-neutral-900 disabled:opacity-50"
            >
              <option value="">{region ? "Selecciona una comuna" : "Elige primero una región"}</option>
              {comunasDe(region).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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
        <h2 className="font-black uppercase text-sm mb-4">Notas del pedido (opcional)</h2>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          placeholder="Instrucciones de entrega, referencias, etc."
          className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6">
        <h2 className="font-black uppercase text-sm mb-4">Cupón de descuento</h2>
        {coupon ? (
          <div className="flex items-center justify-between bg-ajicolor-green/20 rounded-md p-3">
            <span className="text-sm font-bold">Cupón &quot;{coupon.codigo}&quot; aplicado</span>
            <button
              type="button"
              onClick={() => {
                setCoupon(null);
                setCouponInput("");
              }}
              className="text-xs font-bold uppercase text-ajicolor-magenta hover:underline"
            >
              Quitar
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Código de cupón"
              className="flex-1 border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm uppercase"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={couponLoading}
              className="btn-block bg-ajicolor-purple text-white px-4 disabled:opacity-50"
            >
              {couponLoading ? "..." : "Aplicar"}
            </button>
          </div>
        )}
        {couponError && <p className="text-xs font-semibold text-ajicolor-magenta mt-2">{couponError}</p>}
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
          {descuento > 0 && (
            <div className="flex justify-between text-ajicolor-green">
              <span>Descuento</span>
              <span>-{formatCLP(descuento)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600 dark:text-neutral-300">
            <span>Envío</span>
            <span>{costoEnvio > 0 ? formatCLP(costoEnvio) : coupon?.tipo === "envio_gratis" ? "Gratis" : "Por pagar"}</span>
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

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          checked={aceptaTerminos}
          onChange={(e) => setAceptaTerminos(e.target.checked)}
          className="mt-1"
        />
        <span>
          Acepto los{" "}
          <Link href="/terminos" target="_blank" className="text-ajicolor-magenta underline">
            términos y condiciones
          </Link>{" "}
          y la{" "}
          <Link href="/devoluciones" target="_blank" className="text-ajicolor-magenta underline">
            política de cambios y devoluciones
          </Link>
          .
        </span>
      </label>

      {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-block w-full bg-ajicolor-green text-white justify-center py-4 text-base disabled:opacity-50"
      >
        {loading ? "Procesando..." : "Confirmar pedido"}
      </button>

      {whatsapp && (
        <p className="text-center text-xs text-gray-400 dark:text-neutral-500">
          ¿Dudas antes de pagar?{" "}
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ajicolor-green font-bold hover:underline"
          >
            Escríbenos por WhatsApp
          </a>
        </p>
      )}
    </form>
  );
}
