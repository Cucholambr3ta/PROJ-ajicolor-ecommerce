"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Collection {
  id: string;
  nombre: string;
  slug: string;
  activa: boolean;
  fechaLanzamiento: Date | null;
  fechaCierre: Date | null;
  _count: { products: number };
}

export default function ColeccionesPageClient({ colecciones }: { colecciones: Collection[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta colección? Esta acción no se puede deshacer.")) return;
    setError("");
    setDeletingId(id);
    try {
      const { deleteCollection } = await import("@/lib/actions/collections");
      await deleteCollection(id);
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Colecciones / Drops</h1>
        <Link
          href="/admin/colecciones/nuevo"
          className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Nueva colección
        </Link>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <Card>
        {colecciones.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-neutral-400">No hay colecciones registradas.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 dark:text-neutral-400 dark:border-neutral-700">
                <th className="p-4 pb-2">Nombre</th>
                <th className="p-4 pb-2">Slug</th>
                <th className="p-4 pb-2 text-center">Productos</th>
                <th className="p-4 pb-2">Lanzamiento</th>
                <th className="p-4 pb-2">Cierre</th>
                <th className="p-4 pb-2 text-center">Estado</th>
                <th className="p-4 pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {colecciones.map((c) => (
                <tr key={c.id} className="border-b last:border-0 dark:border-neutral-700">
                  <td className="p-4 font-medium">{c.nombre}</td>
                  <td className="p-4 font-mono text-xs text-gray-500 dark:text-neutral-400">{c.slug}</td>
                  <td className="p-4 text-center">{c._count.products}</td>
                  <td className="p-4 text-gray-600 dark:text-neutral-300">
                    {c.fechaLanzamiento ? new Date(c.fechaLanzamiento).toLocaleDateString("es-CL") : "—"}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-neutral-300">
                    {c.fechaCierre ? new Date(c.fechaCierre).toLocaleDateString("es-CL") : "—"}
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={c.activa ? "default" : "outline"}>{c.activa ? "Activa" : "Cerrada"}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/colecciones/nuevo?edit=${c.id}`}
                        className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-neutral-700 text-xs font-medium hover:bg-gray-50 dark:hover:bg-neutral-800"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id || isPending || c._count.products > 0}
                        title={c._count.products > 0 ? "No se puede eliminar: tiene productos asociados" : undefined}
                        className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
