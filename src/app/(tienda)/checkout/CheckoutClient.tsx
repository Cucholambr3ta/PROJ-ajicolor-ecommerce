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
    product: { nombre: string; precio: number; disenoUrl: string };
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

const INPUT_CLS =
  "w-full border-2 border-gray-200 dark:border-neutral-700 rounded-lg px-4 py-3 text-sm bg-white dark:bg-neutral-900 focus:outline-none focus:border-ajicolor-magenta transition-colors";
const LABEL_CLS = "block text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-neutral-400 mb-1.5";

function StepBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-ajicolor-ink dark:bg-ajicolor-magenta text-white text-sm font-black shrink-0">
      {n}
    </span>
  );
}

export default function CheckoutClient({
  customer,
  addresses,
  items,
  subtotal,
  costoEnvioCorreos,
  whatsapp,
}: {
  customer: { nombre: string; telefono: string; direccion: string } | null;
  addresses: SavedAddress[];
  items: Item[];
  subtotal: number;
  costoEnvioCorreos: number;
  whatsapp: string | null;
}) {
  const router = useRouter();
  const esInvitado = !customer;
  const [selectedAddressId, setSelectedAddressId] = useState<string>(addresses[0]?.id ?? "nueva");
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const [email, setEmail] = useState("");
  const [crearCuenta, setCrearCuenta] = useState(false);
  const [password, setPassword] = useState("");

  const [nombre, setNombre] = useState(selectedAddress?.nombre ?? customer?.nombre ?? "");
  const [telefono, setTelefono] = useState(selectedAddress?.telefono ?? customer?.telefono ?? "");
  const [calle, setCalle] = useState(selectedAddress?.calle ?? customer?.direccion ?? "");
  const [numero, setNumero] = useState(selectedAddress?.numero ?? "");
  const [comuna, setComuna] = useState(selectedAddress?.comuna ?? "");
  const [region, setRegion] = useState(selectedAddress?.region ?? "");
  const [metodoEnvio, setMetodoEnvio] = useState<MetodoEnvio>("CorreosSucursal");
  const [notas, setNotas] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailYaRegistrado, setEmailYaRegistrado] = useState(false);
  const [showResumenMobile, setShowResumenMobile] = useState(false);

  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ codigo: string; tipo: string; descuento: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  function handleSelectAddress(id: string) {
    setSelectedAddressId(id);
    if (id === "nueva") {
      setNombre(customer?.nombre ?? "");
      setTelefono(customer?.telefono ?? "");
      setCalle(customer?.direccion ?? "");
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
  const cantidadTotal = items.reduce((acc, item) => acc + item.cantidad, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setEmailYaRegistrado(false);

    if (esInvitado && !email.trim()) {
      setError("Ingresá tu email para continuar");
      return;
    }
    if (esInvitado && crearCuenta && password.trim().length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (!nombre.trim() || !telefono.trim() || !calle.trim() || !numero.trim() || !comuna.trim() || !region.trim()) {
      setError("Todos los campos de dirección son obligatorios");
      return;
    }
    if (!aceptaTerminos) {
      setError("Debes aceptar los términos y condiciones para continuar");
      return;
    }

    setLoading(true);
    const { checkout } = await import("@/lib/actions/cart");
    const result = await checkout({
      nombre,
      telefono,
      calle,
      numero,
      comuna,
      region,
      metodoEnvio,
      couponCode: coupon?.codigo,
      notas: notas.trim() || undefined,
      email: esInvitado ? email.trim() : undefined,
      password: esInvitado && crearCuenta ? password : undefined,
    });

    if (!result.ok) {
      setLoading(false);
      if (result.error === "EMAIL_YA_REGISTRADO") {
        setEmailYaRegistrado(true);
        setError("Ya existe una cuenta con ese email.");
        return;
      }
      setError(result.error || "Error al confirmar el pedido");
      return;
    }

    if (esInvitado) {
      router.push(`/pedido/${result.data.numero}?email=${encodeURIComponent(email.trim())}`);
    } else {
      router.push(`/pedido/${result.data.numero}`);
    }
  }

  const resumen = (
    <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6">
      <h2 className="font-black uppercase text-sm mb-4">Tu pedido</h2>
      <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative shrink-0 w-16 h-16 thick-border bg-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.variant.product.disenoUrl}
                alt={item.variant.product.nombre}
                className="w-full h-full object-cover"
              />
              <span className="absolute -top-2 -right-2 bg-ajicolor-ink text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                {item.cantidad}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{item.variant.product.nombre}</p>
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                {item.variant.talle} / {item.variant.color}
              </p>
            </div>
            <p className="text-sm font-bold shrink-0">{formatCLP(item.variant.product.precio * item.cantidad)}</p>
          </div>
        ))}
      </div>

      <div className="h-px bg-gray-200 dark:bg-neutral-700 my-4" />

      {coupon ? (
        <div className="flex items-center justify-between bg-ajicolor-green/20 rounded-md p-3 mb-4">
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
        <div className="flex gap-2 mb-4 mr-1">
          <input
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Código de cupón"
            className="flex-1 min-w-0 border-2 border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm uppercase bg-white dark:bg-neutral-900 focus:outline-none focus:border-ajicolor-magenta"
          />
          <button
            type="button"
            onClick={handleApplyCoupon}
            disabled={couponLoading}
            className="btn-block shrink-0 bg-ajicolor-purple text-white px-4 text-xs disabled:opacity-50"
          >
            {couponLoading ? "..." : "Aplicar"}
          </button>
        </div>
      )}
      {couponError && <p className="text-xs font-semibold text-ajicolor-magenta -mt-2 mb-4">{couponError}</p>}

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between text-gray-600 dark:text-neutral-300">
          <span>Subtotal ({cantidadTotal} {cantidadTotal === 1 ? "producto" : "productos"})</span>
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
        <div className="h-px bg-gray-200 dark:bg-neutral-700 my-2" />
        <div className="flex justify-between font-black text-xl text-ajicolor-magenta">
          <span>Total</span>
          <span>{formatCLP(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
      {/* Resumen — plegable arriba en mobile, sticky a la derecha en desktop */}
      <div className="lg:hidden lg:order-2">
        <button
          type="button"
          onClick={() => setShowResumenMobile((v) => !v)}
          className="w-full bg-white dark:bg-neutral-900 thick-border pop-shadow-sm p-4 flex items-center justify-between"
        >
          <span className="text-sm font-bold">
            {showResumenMobile ? "Ocultar" : "Mostrar"} resumen ({cantidadTotal} {cantidadTotal === 1 ? "producto" : "productos"})
          </span>
          <span className="text-lg font-black text-ajicolor-magenta">{formatCLP(total)}</span>
        </button>
        {showResumenMobile && <div className="mt-4">{resumen}</div>}
      </div>

      <div className="space-y-6 lg:order-1">
        {esInvitado && (
          <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6">
            <h2 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
              <StepBadge n={1} /> Contacto
            </h2>
            <div>
              <label htmlFor="chk-email" className={LABEL_CLS}>Email</label>
              <input
                id="chk-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailYaRegistrado(false);
                }}
                placeholder="tu@email.com"
                className={INPUT_CLS}
              />
              {emailYaRegistrado && (
                <p className="text-xs font-semibold text-ajicolor-magenta mt-2">
                  Ya existe una cuenta con ese email.{" "}
                  <Link href="/login-cliente" className="underline">
                    Iniciá sesión
                  </Link>{" "}
                  para continuar — tu carrito se mantiene.
                </p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm mt-4">
              <input
                type="checkbox"
                checked={crearCuenta}
                onChange={(e) => setCrearCuenta(e.target.checked)}
                className="accent-ajicolor-magenta"
              />
              Crear una cuenta para seguir mis pedidos más fácil
            </label>

            {crearCuenta && (
              <div className="mt-3">
                <label htmlFor="chk-password" className={LABEL_CLS}>Contraseña</label>
                <input
                  id="chk-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={INPUT_CLS}
                />
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6">
          <h2 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
            <StepBadge n={esInvitado ? 2 : 1} /> Dirección de envío
          </h2>

          {addresses.length > 0 && (
            <div className="mb-4">
              <label className={LABEL_CLS}>Usar una dirección guardada</label>
              <select
                value={selectedAddressId}
                onChange={(e) => handleSelectAddress(e.target.value)}
                className={INPUT_CLS}
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
              <label htmlFor="chk-nombre" className={LABEL_CLS}>Nombre completo</label>
              <input id="chk-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label htmlFor="chk-telefono" className={LABEL_CLS}>Teléfono</label>
              <input id="chk-telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={INPUT_CLS} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="chk-calle" className={LABEL_CLS}>Calle</label>
              <input id="chk-calle" value={calle} onChange={(e) => setCalle(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label htmlFor="chk-numero" className={LABEL_CLS}>Número / Depto</label>
              <input id="chk-numero" value={numero} onChange={(e) => setNumero(e.target.value)} className={INPUT_CLS} />
            </div>
            <div>
              <label htmlFor="chk-region" className={LABEL_CLS}>Región</label>
              <select
                id="chk-region"
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setComuna("");
                }}
                className={INPUT_CLS}
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
              <label htmlFor="chk-comuna" className={LABEL_CLS}>Comuna</label>
              <select
                id="chk-comuna"
                value={comuna}
                onChange={(e) => setComuna(e.target.value)}
                disabled={!region}
                className={`${INPUT_CLS} disabled:opacity-50`}
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
          <h2 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
            <StepBadge n={esInvitado ? 3 : 2} /> Método de envío
          </h2>
          <div className="space-y-2">
            {METODOS.map((m) => (
              <label
                key={m.value}
                className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  metodoEnvio === m.value
                    ? "border-ajicolor-magenta bg-ajicolor-magenta/5"
                    : "border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600"
                }`}
              >
                <input
                  type="radio"
                  name="metodoEnvio"
                  checked={metodoEnvio === m.value}
                  onChange={() => setMetodoEnvio(m.value)}
                  className="mt-1 accent-ajicolor-magenta"
                />
                <div className="flex-1">
                  <div className="flex justify-between text-sm font-bold">
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
          <h2 className="font-black uppercase text-sm mb-4 flex items-center gap-2">
            <StepBadge n={esInvitado ? 4 : 3} /> Notas del pedido <span className="text-gray-400 font-normal normal-case">(opcional)</span>
          </h2>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            placeholder="Instrucciones de entrega, referencias, etc."
            className={INPUT_CLS}
          />
        </div>

        <div className="bg-ajicolor-yellow/30 border-2 border-ajicolor-yellow rounded-lg p-4 text-sm">
          Todas nuestras poleras son 100% serigrafía, hechas por encargo. El plazo de producción es de
          5 a 7 días hábiles desde que confirmamos tu pago.
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            className="mt-1 accent-ajicolor-magenta"
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
          {loading ? "Procesando..." : `Confirmar pedido — ${formatCLP(total)}`}
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
      </div>

      <div className="hidden lg:block lg:order-2 lg:sticky lg:top-8">{resumen}</div>
    </form>
  );
}
