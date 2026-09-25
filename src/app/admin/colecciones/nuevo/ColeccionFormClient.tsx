"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toDateInputValue(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 10);
}

export default function ColeccionFormClient({
  initialData,
}: {
  initialData?: {
    id: string;
    nombre: string;
    slug: string;
    descripcion: string | null;
    fechaLanzamiento: Date | null;
    fechaCierre: Date | null;
    activa: boolean;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!initialData;

  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugEditado, setSlugEditado] = useState(isEdit);
  const [descripcion, setDescripcion] = useState(initialData?.descripcion ?? "");
  const [fechaLanzamiento, setFechaLanzamiento] = useState(toDateInputValue(initialData?.fechaLanzamiento));
  const [fechaCierre, setFechaCierre] = useState(toDateInputValue(initialData?.fechaCierre));
  const [activa, setActiva] = useState(initialData?.activa ?? true);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !slug.trim()) {
      setError("El nombre y el slug son obligatorios");
      return;
    }

    const payload = {
      nombre,
      slug,
      descripcion: descripcion || undefined,
      fechaLanzamiento: fechaLanzamiento ? new Date(fechaLanzamiento) : undefined,
      fechaCierre: fechaCierre ? new Date(fechaCierre) : undefined,
      activa,
    };

    try {
      if (isEdit) {
        const { updateCollection } = await import("@/lib/actions/collections");
        await updateCollection(initialData.id, payload);
      } else {
        const { createCollection } = await import("@/lib/actions/collections");
        await createCollection(payload);
      }
      startTransition(() => router.push("/admin/colecciones"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/colecciones" className="text-sm text-gray-500 hover:underline dark:text-neutral-400">
          ← Volver a Colecciones
        </Link>
        <h1 className="text-2xl font-black mt-2">{isEdit ? "Editar Colección" : "Nueva Colección"}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (!slugEditado) setSlug(slugify(e.target.value));
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Slug (URL) *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugEditado(true);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Fecha de lanzamiento</label>
              <input
                type="date"
                value={fechaLanzamiento}
                onChange={(e) => setFechaLanzamiento(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Fecha de cierre</label>
              <input
                type="date"
                value={fechaCierre}
                onChange={(e) => setFechaCierre(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-neutral-300">
                <input type="checkbox" checked={activa} onChange={(e) => setActiva(e.target.checked)} />
                Colección activa (visible en la tienda)
              </label>
            </div>
          </div>
        </Card>

        {error && <p className="text-red-500 text-sm mb-4 dark:text-red-400">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link href="/admin/colecciones" className="px-4 py-2 rounded-md btn-block bg-white dark:bg-neutral-900">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="btn-block bg-ajicolor-magenta text-white disabled:opacity-50"
          >
            {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear colección"}
          </button>
        </div>
      </form>
    </div>
  );
}
