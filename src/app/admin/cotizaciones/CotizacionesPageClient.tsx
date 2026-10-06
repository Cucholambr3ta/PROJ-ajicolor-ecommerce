"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCLP, formatFecha } from "@/lib/format";

type Estado = "Pendiente" | "EnRevision" | "Cotizada" | "Aceptada" | "Rechazada";

interface Cotizacion {
  id: string;
  nombreContacto: string;
  emailContacto: string;
  telefonoContacto: string | null;
  prenda: string;
  colorNombre: string;
  talla: string | null;
  cantidad: number;
  disenoUrl: string;
  notas: string | null;
  precioCotizado: number | null;
  estado: Estado;
  createdAt: Date;
  tieneCliente: boolean;
  orderNumero: number | null;
}

interface Metrics {
  total: number;
  porEstado: Record<string, number>;
  aceptadas: number;
  convertidasAPedido: number;
  tasaConversion: number;
}

const ESTADOS: Estado[] = ["Pendiente", "EnRevision", "Cotizada", "Aceptada", "Rechazada"];

export default function CotizacionesPageClient({
  cotizaciones,
  metrics,
}: {
  cotizaciones: Cotizacion[];
  metrics: Metrics;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filtro, setFiltro] = useState<Estado | "Todas">("Todas");
  const [precioDrafts, setPrecioDrafts] = useState<Record<string, string>>({});

  const visibles = filtro === "Todas" ? cotizaciones : cotizaciones.filter((c) => c.estado === filtro);

  async function cambiarEstado(id: string, estado: Estado) {
    const { actualizarCotizacion } = await import("@/lib/actions/cotizador");
    await actualizarCotizacion(id, { estado });
    startTransition(() => router.refresh());
  }

  async function guardarPrecio(id: string) {
    const draft = precioDrafts[id];
    const precio = draft ? parseInt(draft.replace(/\D/g, ""), 10) : NaN;
    if (Number.isNaN(precio) || precio <= 0) return;
    const { actualizarCotizacion } = await import("@/lib/actions/cotizador");
    await actualizarCotizacion(id, { precioCotizado: precio, estado: "Cotizada" });
    startTransition(() => router.refresh());
  }

  async function convertir(id: string) {
    if (!confirm("¿Generar el pedido real a partir de esta cotización?")) return;
    const { convertirCotizacionAPedido } = await import("@/lib/actions/cotizador");
    const result = await convertirCotizacionAPedido(id);
    if (!result.ok) {
      alert(result.error);
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-6 dark:text-neutral-100">Cotizaciones</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-ajicolor-yellow thick-border pop-shadow p-4">
          <p className="text-xs font-bold uppercase tracking-wide mb-1 opacity-70">Total recibidas</p>
          <h3 className="text-2xl font-black">{metrics.total}</h3>
        </div>
        <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-4">
          <p className="text-xs font-bold uppercase tracking-wide mb-1 opacity-70 dark:text-neutral-400">Pendientes</p>
          <h3 className="text-2xl font-black dark:text-neutral-100">{metrics.porEstado["Pendiente"] ?? 0}</h3>
        </div>
        <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-4">
          <p className="text-xs font-bold uppercase tracking-wide mb-1 opacity-70 dark:text-neutral-400">Cotizadas</p>
          <h3 className="text-2xl font-black dark:text-neutral-100">{metrics.porEstado["Cotizada"] ?? 0}</h3>
        </div>
        <div className="bg-ajicolor-green text-white thick-border pop-shadow p-4">
          <p className="text-xs font-bold uppercase tracking-wide mb-1 opacity-80">Aceptadas</p>
          <h3 className="text-2xl font-black">{metrics.aceptadas}</h3>
        </div>
        <div className="bg-ajicolor-purple text-white thick-border pop-shadow p-4">
          <p className="text-xs font-bold uppercase tracking-wide mb-1 opacity-80">Conversión a pedido</p>
          <h3 className="text-2xl font-black">{metrics.tasaConversion}%</h3>
          <p className="text-[10px] opacity-70 mt-0.5">{metrics.convertidasAPedido} de {metrics.total}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <Badge variant={filtro === "Todas" ? "default" : "outline"} className="cursor-pointer" onClick={() => setFiltro("Todas")}>
          Todas ({cotizaciones.length})
        </Badge>
        {ESTADOS.map((e) => (
          <Badge
            key={e}
            variant={filtro === e ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setFiltro(e)}
          >
            {e} ({metrics.porEstado[e] ?? 0})
          </Badge>
        ))}
      </div>

      {visibles.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 dark:text-neutral-400">No hay cotizaciones para mostrar.</Card>
      ) : (
        <div className="space-y-4">
          {visibles.map((c) => (
            <Card key={c.id} className="p-5">
              <div className="flex flex-col md:flex-row gap-4">
                <a href={c.disenoUrl} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.disenoUrl}
                    alt="Diseño del cliente"
                    className="w-24 h-24 object-cover thick-border"
                  />
                </a>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-bold dark:text-neutral-100">
                        {c.nombreContacto}
                        {!c.tieneCliente && (
                          <span className="ml-2 text-[10px] font-bold uppercase text-gray-400 dark:text-neutral-500">
                            sin cuenta
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-neutral-400">
                        {c.emailContacto} {c.telefonoContacto ? `· ${c.telefonoContacto}` : ""}
                      </p>
                    </div>
                    <Badge variant={c.estado === "Rechazada" ? "destructive" : "outline"}>{c.estado}</Badge>
                  </div>

                  <p className="text-sm mt-2 dark:text-neutral-200">
                    <strong>{c.prenda}</strong> — {c.colorNombre}
                    {c.talla ? ` — Talla ${c.talla}` : ""} — {c.cantidad} unidad{c.cantidad !== 1 ? "es" : ""}
                  </p>
                  {c.notas && <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">{c.notas}</p>}
                  <p className="text-[11px] text-gray-400 dark:text-neutral-500 mt-1">{formatFecha(c.createdAt)}</p>

                  {c.orderNumero != null ? (
                    <div className="mt-3">
                      <Link
                        href="/admin/pedidos"
                        className="text-xs font-bold text-ajicolor-green hover:underline"
                      >
                        → Pedido #{String(c.orderNumero).padStart(4, "0")} generado
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={c.precioCotizado ? formatCLP(c.precioCotizado) : "Precio total ($)"}
                        defaultValue={c.precioCotizado ?? ""}
                        onChange={(e) => setPrecioDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                        className="w-36 border border-gray-300 dark:border-neutral-700 rounded-md px-2 py-1.5 text-sm dark:bg-neutral-900 dark:text-neutral-100"
                      />
                      <button
                        onClick={() => guardarPrecio(c.id)}
                        disabled={isPending}
                        className="px-3 py-1.5 rounded-md bg-ajicolor-yellow text-xs font-bold hover:opacity-90"
                      >
                        Fijar precio
                      </button>

                      {c.estado !== "Aceptada" && c.estado !== "Rechazada" && (
                        <>
                          <button
                            onClick={() => cambiarEstado(c.id, "Aceptada")}
                            disabled={isPending || !c.precioCotizado}
                            title={!c.precioCotizado ? "Fija un precio primero" : undefined}
                            className="px-3 py-1.5 rounded-md bg-ajicolor-green text-white text-xs font-medium hover:opacity-90 disabled:opacity-40"
                          >
                            Marcar aceptada
                          </button>
                          <button
                            onClick={() => cambiarEstado(c.id, "Rechazada")}
                            disabled={isPending}
                            className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50"
                          >
                            Rechazar
                          </button>
                        </>
                      )}

                      {c.estado === "Aceptada" && (
                        <button
                          onClick={() => convertir(c.id)}
                          disabled={isPending || !c.tieneCliente}
                          title={!c.tieneCliente ? "El contacto no tiene cuenta de cliente todavía" : undefined}
                          className="px-3 py-1.5 rounded-md bg-ajicolor-purple text-white text-xs font-bold hover:opacity-90 disabled:opacity-40"
                        >
                          Generar pedido
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
