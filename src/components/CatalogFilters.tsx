"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, FormEvent } from "react";

export function CatalogFilters({
  colores,
  talles,
  collections,
}: {
  colores: string[];
  talles: string[];
  collections: { slug: string; nombre: string }[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    updateParam("q", q);
  }

  const activeColor = searchParams.get("color") ?? "";
  const activeTalle = searchParams.get("talle") ?? "";
  const activeCollection = searchParams.get("coleccion") ?? "";
  const activeOrden = searchParams.get("orden") ?? "recientes";

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por diseño o banda..."
          className="flex-1 border-2 border-ajicolor-ink px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
        />
        <button type="submit" className="btn-block bg-ajicolor-yellow px-6">
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap gap-3 items-center text-xs font-bold uppercase">
        {collections.length > 0 && (
          <select
            value={activeCollection}
            onChange={(e) => updateParam("coleccion", e.target.value)}
            className="border-2 border-ajicolor-ink px-3 py-2 bg-white dark:bg-neutral-900"
          >
            <option value="">Todas las colecciones</option>
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nombre}
              </option>
            ))}
          </select>
        )}

        {colores.length > 0 && (
          <select
            value={activeColor}
            onChange={(e) => updateParam("color", e.target.value)}
            className="border-2 border-ajicolor-ink px-3 py-2 bg-white dark:bg-neutral-900"
          >
            <option value="">Todos los colores</option>
            {colores.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        {talles.length > 0 && (
          <select
            value={activeTalle}
            onChange={(e) => updateParam("talle", e.target.value)}
            className="border-2 border-ajicolor-ink px-3 py-2 bg-white dark:bg-neutral-900"
          >
            <option value="">Todas las tallas</option>
            {talles.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        )}

        <select
          value={activeOrden}
          onChange={(e) => updateParam("orden", e.target.value)}
          className="border-2 border-ajicolor-ink px-3 py-2 bg-white dark:bg-neutral-900"
        >
          <option value="recientes">Más recientes</option>
          <option value="precio-asc">Precio: menor a mayor</option>
          <option value="precio-desc">Precio: mayor a menor</option>
        </select>

        {(activeColor || activeTalle || activeCollection || searchParams.get("q")) && (
          <button
            onClick={() => router.push(pathname)}
            className="text-ajicolor-magenta hover:underline normal-case font-semibold"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
