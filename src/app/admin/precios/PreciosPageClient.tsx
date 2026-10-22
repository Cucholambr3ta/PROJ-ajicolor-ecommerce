"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TALLES_ADULTO, TALLES_KIDS, TALLE_UNICO, usaTalles } from "@/lib/talles";

type TipoProducto = "Polera" | "Poleron" | "Totebag" | "Reloj" | "Papeleria";

const TIPOS_PRODUCTO: { value: TipoProducto; label: string }[] = [
  { value: "Polera", label: "Polera" },
  { value: "Poleron", label: "Polerón" },
  { value: "Totebag", label: "Totebag" },
  { value: "Reloj", label: "Reloj" },
  { value: "Papeleria", label: "Papelería" },
];

interface ReglaData {
  id: string;
  tipo: TipoProducto;
  talleDesde: string;
  talleHasta: string;
  precio: number;
}

type CategoriaProducto = "Adulto" | "Kids";

interface GuiaData {
  id: string;
  tipo: TipoProducto;
  categoria: CategoriaProducto;
  imageUrl: string;
}

/** Guía de tallas (vector con medidas) solo aplica a tipos con talles
 * reales (Polera, Polerón) — el resto no tiene nada que medir por talla. */
const TIPOS_CON_GUIA = TIPOS_PRODUCTO.filter((t) => usaTalles(t.value));

/** Opciones de talle para el selector desde/hasta de un tipo — Polera y
 * Polerón ofrecen ambas listas (Adulto + Kids, porque el mismo tipo cubre
 * las dos categorías con reglas separadas); el resto usa el talle único. */
function opcionesTalle(tipo: TipoProducto): string[] {
  if (!usaTalles(tipo)) return [TALLE_UNICO];
  return [...TALLES_ADULTO, ...TALLES_KIDS];
}

export default function PreciosPageClient({ reglas, guias }: { reglas: ReglaData[]; guias: GuiaData[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [guiasState, setGuiasState] = useState(guias);
  const [subiendoGuia, setSubiendoGuia] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoProducto>("Polera");
  const opciones = opcionesTalle(tipo);
  const [talleDesde, setTalleDesde] = useState(opciones[0]);
  const [talleHasta, setTalleHasta] = useState(opciones[0]);
  const [precio, setPrecio] = useState(0);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  function handleTipoChange(nuevo: TipoProducto) {
    setTipo(nuevo);
    const nuevasOpciones = opcionesTalle(nuevo);
    setTalleDesde(nuevasOpciones[0]);
    setTalleHasta(nuevasOpciones[0]);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { createPriceRule } = await import("@/lib/pricing");
      await createPriceRule({ tipo, talleDesde, talleHasta, precio });
      setPrecio(0);
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear la regla de precio");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta regla de precio?")) return;
    setDeleting(id);
    try {
      const { deletePriceRule } = await import("@/lib/pricing");
      await deletePriceRule(id);
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar la regla");
    } finally {
      setDeleting(null);
    }
  }

  async function handleUploadGuia(tipoGuia: TipoProducto, categoria: CategoriaProducto, file: File | null) {
    if (!file) return;
    const key = `${tipoGuia}-${categoria}`;
    setSubiendoGuia(key);
    setError("");
    try {
      const { setTallaGuia } = await import("@/lib/actions/tallaGuia");
      const formData = new FormData();
      formData.append("file", file);
      const guardada = await setTallaGuia(tipoGuia, categoria, formData);
      setGuiasState((prev) => [
        ...prev.filter((g) => !(g.tipo === tipoGuia && g.categoria === categoria)),
        { id: guardada.id, tipo: guardada.tipo, categoria: guardada.categoria, imageUrl: guardada.imageUrl },
      ]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir la guía de tallas");
    } finally {
      setSubiendoGuia(null);
    }
  }

  async function handleDeleteGuia(id: string) {
    if (!confirm("¿Quitar esta guía de tallas?")) return;
    try {
      const { deleteTallaGuia } = await import("@/lib/actions/tallaGuia");
      await deleteTallaGuia(id);
      setGuiasState((prev) => prev.filter((g) => g.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al quitar la guía");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Precios</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
          Precio por tipo de prenda y rango de talla — aplica a todos los productos de ese tipo salvo que un drop
          tenga su propio precio especial (eso se carga desde la ficha del producto en Catálogo).
        </p>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 dark:text-neutral-200 mb-4">Agregar rango de precio</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => handleTipoChange(e.target.value as TipoProducto)}
              className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
            >
              {TIPOS_PRODUCTO.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Desde talle</label>
            <select
              value={talleDesde}
              onChange={(e) => setTalleDesde(e.target.value)}
              className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
            >
              {opciones.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Hasta talle</label>
            <select
              value={talleHasta}
              onChange={(e) => setTalleHasta(e.target.value)}
              className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
            >
              {opciones.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Precio</label>
            <input
              type="number"
              min={0}
              value={precio}
              onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)}
              className="no-spinner w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-md btn-block bg-ajicolor-magenta text-white disabled:opacity-50"
          >
            + Agregar
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3 dark:text-neutral-500">
          Ej: Polera, desde S hasta XL, $15.000 — y otra fila Polera, desde 2XL hasta 2XL, $17.000.
        </p>
        {error && <p className="text-red-500 text-sm mt-3 dark:text-red-400">{error}</p>}
      </Card>

      {TIPOS_PRODUCTO.map(({ value, label }) => {
        const lista = reglas.filter((r) => r.tipo === value);
        return (
          <Card key={value} className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="font-semibold text-gray-700 dark:text-neutral-200">{label}</h2>
              <Badge variant="outline">{lista.length}</Badge>
            </div>
            {lista.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                Sin precio cargado todavía — los productos de este tipo usan el precio que tengan guardado en su
                propia ficha hasta que se agregue una regla acá.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {lista.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between gap-2 border border-gray-200 dark:border-neutral-700 rounded-md px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium dark:text-neutral-100">
                        {r.talleDesde === r.talleHasta ? r.talleDesde : `${r.talleDesde} – ${r.talleHasta}`}
                      </p>
                      <p className="text-xs text-ajicolor-magenta font-bold">${r.precio.toLocaleString("es-CL")}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-1.5 py-1 text-xs shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 dark:text-neutral-200 mb-1">Guía de tallas</h2>
        <p className="text-xs text-gray-400 mb-4 dark:text-neutral-500">
          Imagen vector de la prenda con las medidas marcadas — una por tipo y categoría (Adulto/Kids), se reutiliza
          en todos los productos de ese tipo. Se muestra junto a la tabla de medidas al hacer clic en &ldquo;Guía de
          tallas&rdquo; en la ficha del producto.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TIPOS_CON_GUIA.map(({ value, label }) =>
            (["Adulto", "Kids"] as const).map((categoria) => {
              const key = `${value}-${categoria}`;
              const existente = guiasState.find((g) => g.tipo === value && g.categoria === categoria);
              return (
                <div key={key} className="border border-gray-200 dark:border-neutral-700 rounded-md p-4">
                  <p className="text-sm font-medium mb-3 dark:text-neutral-100">
                    {label} — {categoria === "Adulto" ? "Adulto" : "Kids"}
                  </p>
                  {existente ? (
                    <div className="relative w-32 h-32 thick-border overflow-hidden group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={existente.imageUrl} alt={key} className="w-full h-full object-contain bg-white" />
                      <button
                        type="button"
                        onClick={() => handleDeleteGuia(existente.id)}
                        className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center w-32 h-32 thick-border border-dashed text-xs text-gray-400 dark:text-neutral-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800">
                      {subiendoGuia === key ? "Subiendo..." : "+ Subir imagen"}
                      <input
                        type="file"
                        accept="image/*,.svg"
                        disabled={subiendoGuia === key}
                        onChange={(e) => handleUploadGuia(value, categoria, e.target.files?.[0] ?? null)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
}
