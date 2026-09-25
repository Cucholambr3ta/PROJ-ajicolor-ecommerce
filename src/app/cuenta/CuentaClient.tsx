"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatCLP, formatFechaCorta } from "@/lib/format";

interface Customer {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  direccion: string | null;
  image: string | null;
  fechaRegistro: string;
  totalGastado: number;
  backstagePass: boolean;
  tienePassword: boolean;
}

interface Order {
  id: string;
  numero: number;
  estado: string;
  total: number;
  createdAt: string;
  itemsCount: number;
  transportista: string | null;
  trackingNumber: string | null;
}

interface Address {
  id: string;
  etiqueta: string | null;
  nombre: string;
  telefono: string;
  calle: string;
  numero: string;
  comuna: string;
  region: string;
  esPrincipal: boolean;
}

interface Favorite {
  id: string;
  productId: string;
  nombre: string;
  disenoUrl: string;
  precio: number;
}

const TABS = [
  { id: "pedidos", label: "Pedidos" },
  { id: "datos", label: "Mis datos" },
  { id: "direcciones", label: "Direcciones" },
  { id: "favoritos", label: "Favoritos" },
  { id: "seguridad", label: "Seguridad" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TRACKING_URLS: Record<string, (t: string) => string> = {
  Chilexpress: (t) => `https://www.chilexpress.cl/seguimiento/${t}`,
  Starken: (t) => `https://www.starken.cl/seguimiento?codigo=${t}`,
};

export default function CuentaClient({
  customer,
  orders,
  addresses,
  favorites,
}: {
  customer: Customer;
  orders: Order[];
  addresses: Address[];
  favorites: Favorite[];
}) {
  const [tab, setTab] = useState<TabId>("pedidos");

  return (
    <div className="grid lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1">
        <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6 text-center mb-4">
          <div className="w-20 h-20 rounded-full bg-ajicolor-purple mx-auto mb-4 flex items-center justify-center overflow-hidden">
            {customer.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={customer.image} alt={customer.nombre} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-2xl font-black">
                {customer.nombre.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h2 className="font-black">{customer.nombre}</h2>
          <p className="text-xs text-gray-400 dark:text-neutral-500">{customer.email}</p>
        </div>

        <nav className="flex lg:flex-col gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-left px-4 py-2.5 text-sm font-bold uppercase whitespace-nowrap thick-border ${
                tab === t.id
                  ? "bg-ajicolor-ink text-white"
                  : "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="lg:col-span-3">
        {tab === "pedidos" && <PedidosTab orders={orders} totalGastado={customer.totalGastado} />}
        {tab === "datos" && <DatosTab customer={customer} />}
        {tab === "direcciones" && <DireccionesTab addresses={addresses} />}
        {tab === "favoritos" && <FavoritosTab favorites={favorites} />}
        {tab === "seguridad" && <SeguridadTab tienePassword={customer.tienePassword} />}
      </div>
    </div>
  );
}

function PedidosTab({ orders, totalGastado }: { orders: Order[]; totalGastado: number }) {
  return (
    <div className="space-y-6">
      <div className="bg-ajicolor-yellow p-4 thick-border pop-shadow flex justify-between text-xs font-bold uppercase">
        <span>{orders.length} pedido{orders.length !== 1 ? "s" : ""}</span>
        <span>Total gastado: {formatCLP(totalGastado)}</span>
      </div>

      {orders.length === 0 ? (
        <div className="p-10 border-2 border-dashed border-gray-300 dark:border-neutral-700 text-center">
          <p className="text-gray-400 dark:text-neutral-500 font-medium">Sin pedidos todavía.</p>
        </div>
      ) : (
        orders.map((order) => {
          const isDelivered = order.estado === "Entregado";
          return (
            <div
              key={order.id}
              className="bg-white dark:bg-neutral-900 p-6 thick-border pop-shadow flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
            >
              <div>
                <Link
                  href={`/pedido/${order.numero}`}
                  className="inline-block bg-ajicolor-ink text-white px-3 py-1 text-[10px] font-bold uppercase mb-3 hover:opacity-80"
                >
                  Orden #{String(order.numero).padStart(4, "0")}
                </Link>
                <h3 className="text-lg font-black mb-1">
                  {order.itemsCount} item{order.itemsCount !== 1 ? "s" : ""}
                </h3>
                <p className="text-xs font-medium text-gray-400 dark:text-neutral-500 mb-2">
                  {formatFechaCorta(order.createdAt)}
                  {order.transportista && ` · ${order.transportista}`}
                </p>
                {!isDelivered && order.trackingNumber && (
                  order.transportista && TRACKING_URLS[order.transportista] ? (
                    <a
                      href={TRACKING_URLS[order.transportista](order.trackingNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-block bg-ajicolor-yellow text-[10px] py-1.5 px-3"
                    >
                      Sigue tu envío
                    </a>
                  ) : (
                    <span className="btn-block bg-ajicolor-yellow text-[10px] py-1.5 px-3">
                      Tracking: {order.trackingNumber}
                    </span>
                  )
                )}
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="text-2xl font-black text-ajicolor-magenta">{formatCLP(order.total)}</p>
                <span
                  className={`px-3 py-1 text-[10px] font-bold uppercase ${
                    isDelivered
                      ? "bg-ajicolor-green text-white"
                      : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-300"
                  }`}
                >
                  {order.estado}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function DatosTab({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(customer.nombre);
  const [telefono, setTelefono] = useState(customer.telefono ?? "");
  const [direccion, setDireccion] = useState(customer.direccion ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    const { updateOwnProfile } = await import("@/lib/actions/account");
    const result = await updateOwnProfile({ nombre, telefono, direccion });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6">
      <h2 className="text-xl font-black mb-6">Mis datos</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-2">Email</label>
          <input
            value={customer.email}
            disabled
            className="w-full border-2 border-gray-200 dark:border-neutral-700 px-3 py-2 text-sm bg-gray-50 dark:bg-neutral-800 text-gray-400"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-2">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-2">Teléfono</label>
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-2">Dirección</label>
          <input
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
          />
        </div>

        {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}
        {saved && <p className="text-sm font-semibold text-ajicolor-green">Datos actualizados.</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-block bg-ajicolor-yellow py-2.5 px-6 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}

function DireccionesTab({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    etiqueta: "",
    nombre: "",
    telefono: "",
    calle: "",
    numero: "",
    comuna: "",
    region: "",
    esPrincipal: addresses.length === 0,
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { createOwnAddress } = await import("@/lib/actions/account");
    const result = await createOwnAddress(form);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setShowForm(false);
    setForm({ etiqueta: "", nombre: "", telefono: "", calle: "", numero: "", comuna: "", region: "", esPrincipal: false });
    router.refresh();
  }

  async function handleDelete(id: string) {
    const { deleteOwnAddress } = await import("@/lib/actions/account");
    await deleteOwnAddress(id);
    router.refresh();
  }

  async function handleSetPrincipal(id: string) {
    const { setPrincipalAddress } = await import("@/lib/actions/account");
    await setPrincipalAddress(id);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {addresses.map((addr) => (
        <div key={addr.id} className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-5 flex justify-between items-start gap-4">
          <div className="text-sm">
            <p className="font-black mb-1">
              {addr.etiqueta || "Dirección"}{" "}
              {addr.esPrincipal && (
                <span className="ml-2 bg-ajicolor-green text-white text-[10px] px-2 py-0.5 uppercase font-bold">
                  Principal
                </span>
              )}
            </p>
            <p className="text-gray-600 dark:text-neutral-300">
              {addr.nombre} · {addr.telefono}
              <br />
              {addr.calle} {addr.numero}, {addr.comuna}, {addr.region}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-xs font-bold uppercase">
            {!addr.esPrincipal && (
              <button onClick={() => handleSetPrincipal(addr.id)} className="text-ajicolor-purple hover:underline">
                Hacer principal
              </button>
            )}
            <button onClick={() => handleDelete(addr.id)} className="text-ajicolor-magenta hover:underline">
              Eliminar
            </button>
          </div>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              placeholder="Etiqueta (Casa, Trabajo)"
              value={form.etiqueta}
              onChange={(e) => setForm({ ...form, etiqueta: e.target.value })}
              className="border-2 border-ajicolor-ink px-3 py-2 text-sm"
            />
            <input
              placeholder="Nombre de quien recibe"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
              className="border-2 border-ajicolor-ink px-3 py-2 text-sm"
            />
            <input
              placeholder="Teléfono"
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              required
              className="border-2 border-ajicolor-ink px-3 py-2 text-sm"
            />
            <input
              placeholder="Calle"
              value={form.calle}
              onChange={(e) => setForm({ ...form, calle: e.target.value })}
              required
              className="border-2 border-ajicolor-ink px-3 py-2 text-sm"
            />
            <input
              placeholder="Número"
              value={form.numero}
              onChange={(e) => setForm({ ...form, numero: e.target.value })}
              required
              className="border-2 border-ajicolor-ink px-3 py-2 text-sm"
            />
            <input
              placeholder="Comuna"
              value={form.comuna}
              onChange={(e) => setForm({ ...form, comuna: e.target.value })}
              required
              className="border-2 border-ajicolor-ink px-3 py-2 text-sm"
            />
            <input
              placeholder="Región"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              required
              className="border-2 border-ajicolor-ink px-3 py-2 text-sm"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-bold uppercase">
            <input
              type="checkbox"
              checked={form.esPrincipal}
              onChange={(e) => setForm({ ...form, esPrincipal: e.target.checked })}
            />
            Marcar como principal
          </label>

          {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-block bg-ajicolor-yellow py-2 px-5 disabled:opacity-50">
              {loading ? "Guardando..." : "Guardar dirección"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-xs font-bold uppercase hover:underline">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="btn-block bg-ajicolor-purple text-white py-2.5 px-6"
        >
          + Agregar dirección
        </button>
      )}
    </div>
  );
}

function FavoritosTab({ favorites }: { favorites: Favorite[] }) {
  const router = useRouter();

  async function handleRemove(productId: string) {
    const { toggleFavorite } = await import("@/lib/actions/account");
    await toggleFavorite(productId);
    router.refresh();
  }

  if (favorites.length === 0) {
    return (
      <div className="p-10 border-2 border-dashed border-gray-300 dark:border-neutral-700 text-center">
        <p className="text-gray-400 dark:text-neutral-500 font-medium mb-4">Sin favoritos todavía.</p>
        <Link href="/" className="btn-block bg-ajicolor-yellow inline-flex">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {favorites.map((fav) => (
        <div key={fav.id} className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-4 flex gap-4 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fav.disenoUrl} alt={fav.nombre} className="w-16 h-16 object-cover thick-border" />
          <div className="flex-1">
            <Link href={`/producto/${fav.productId}`} className="font-black hover:underline">
              {fav.nombre}
            </Link>
            <p className="text-ajicolor-magenta font-black text-sm">{formatCLP(fav.precio)}</p>
          </div>
          <button
            onClick={() => handleRemove(fav.productId)}
            className="text-xs font-bold uppercase text-ajicolor-magenta hover:underline"
          >
            Quitar
          </button>
        </div>
      ))}
    </div>
  );
}

function SeguridadTab({ tienePassword }: { tienePassword: boolean }) {
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);
    const { changeOwnPassword } = await import("@/lib/actions/account");
    const result = await changeOwnPassword({ passwordActual, passwordNueva });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setPasswordActual("");
    setPasswordNueva("");
  }

  if (!tienePassword) {
    return (
      <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6">
        <h2 className="text-xl font-black mb-3">Seguridad</h2>
        <p className="text-sm text-gray-600 dark:text-neutral-300">
          Tu cuenta inició sesión con Google. No tienes una contraseña propia que cambiar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6">
      <h2 className="text-xl font-black mb-6">Cambiar contraseña</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-2">Contraseña actual</label>
          <input
            type="password"
            value={passwordActual}
            onChange={(e) => setPasswordActual(e.target.value)}
            required
            className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-2">Nueva contraseña</label>
          <input
            type="password"
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            required
            minLength={8}
            className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
          />
        </div>

        {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}
        {saved && <p className="text-sm font-semibold text-ajicolor-green">Contraseña actualizada.</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-block bg-ajicolor-yellow py-2.5 px-6 disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </form>
    </div>
  );
}
