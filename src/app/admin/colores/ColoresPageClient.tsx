"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ColorData {
  id: string;
  nombre: string;
  hex: string;
  categoria: "Adulto" | "Kids";
}

export default function ColoresPageClient({ colores }: { colores: ColorData[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [nombre, setNombre] = useState("");
  const [hex, setHex] = useState("#000000");
  const [categoria, setCategoria] = useState<"Adulto" | "Kids">("Adulto");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { createColor } = await import("@/lib/actions/colors");
      await createColor({ nombre, hex, categoria });
      setNombre("");
      setHex("#000000");
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al crear el color");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este color de la paleta? Los productos que ya lo usan no se ven afectados.")) return;
    setDeleting(id);
    try {
      const { deleteColor } = await import("@/lib/actions/colors");
      await deleteColor(id);
      startTransition(() => router.refresh());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar el color");
    } finally {
      setDeleting(null);
    }
  }

  const adulto = colores.filter((c) => c.categoria === "Adulto");
  const kids = colores.filter((c) => c.categoria === "Kids");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black">Paleta de colores</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
          Colores de tela disponibles por categoría — se usan al cargar productos y en el selector de color de la ficha.
        </p>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 dark:text-neutral-200 mb-4">Agregar color nuevo</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Verde Jade"
              required
              className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="w-10 h-9 border border-gray-300 dark:border-neutral-700 rounded-md cursor-pointer bg-white dark:bg-neutral-900"
              />
              <input
                type="text"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm font-mono dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 dark:text-neutral-300">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value as "Adulto" | "Kids")}
              className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 dark:text-neutral-100"
            >
              <option value="Adulto">Adulto</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-md btn-block bg-ajicolor-magenta text-white disabled:opacity-50"
          >
            + Agregar color
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-3 dark:text-red-400">{error}</p>}
      </Card>

      {[
        { titulo: "Adulto", lista: adulto },
        { titulo: "Kids", lista: kids },
      ].map(({ titulo, lista }) => (
        <Card key={titulo} className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-neutral-200">{titulo}</h2>
            <Badge variant="outline">{lista.length}</Badge>
          </div>
          {lista.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-neutral-400">Sin colores en esta categoría todavía.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {lista.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-2 border border-gray-200 dark:border-neutral-700 rounded-md px-3 py-2"
                >
                  <span
                    className="w-6 h-6 rounded-full border border-gray-300 dark:border-neutral-600 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate dark:text-neutral-100">{c.nombre}</p>
                    <p className="text-[10px] text-gray-400 dark:text-neutral-500 font-mono">{c.hex}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deleting === c.id}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-1.5 py-1 text-xs shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
