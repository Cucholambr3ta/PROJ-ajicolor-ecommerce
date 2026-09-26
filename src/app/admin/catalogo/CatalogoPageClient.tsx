"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  nombre: string;
  descripcion: string;
  artista: string;
  temporada: string;
  variants: { id: string; talle: string; color: string; stock: number }[];
}

export default function CatalogoPageClient({ productos }: { productos: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [q, setQ] = useState("");

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto y todas sus variantes?")) return;
    setDeleting(id);
    const { deleteProduct } = await import("@/lib/actions/products");
    await deleteProduct(id);
    setDeleting(null);
    startTransition(() => router.refresh());
  }

  const filtrados = q.trim()
    ? productos.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q.toLowerCase()) ||
          p.artista.toLowerCase().includes(q.toLowerCase())
      )
    : productos;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Catálogo</h1>
        <Link
          href="/admin/catalogo/nuevo"
          className="btn-block bg-ajicolor-magenta text-white"
        >
          + Nuevo producto
        </Link>
      </div>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar por nombre o artista..."
        className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900 mb-4"
      />

      <Card>
        {filtrados.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-neutral-400">No hay productos para mostrar.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
                <th className="p-4 pb-2">Producto</th>
                <th className="p-4 pb-2">Artista</th>
                <th className="p-4 pb-2">Temporada</th>
                <th className="p-4 pb-2 text-center">Variantes</th>
                <th className="p-4 pb-2 text-center">Stock total</th>
                <th className="p-4 pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr key={p.id} className="border-b last:border-0 dark:border-neutral-700">
                  <td className="p-4">
                    <Link href={`/admin/catalogo/${p.id}`} className="font-medium hover:underline">
                      {p.nombre}
                    </Link>
                    <p className="text-xs text-gray-400 line-clamp-1 dark:text-neutral-500">{p.descripcion}</p>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-neutral-300">{p.artista}</td>
                  <td className="p-4 text-gray-600 dark:text-neutral-300">{p.temporada}</td>
                  <td className="p-4 text-center">
                    <Badge variant="outline">{p.variants.length}</Badge>
                  </td>
                  <td className="p-4 text-center font-medium">
                    {p.variants.reduce((acc, v) => acc + v.stock, 0)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/catalogo/nuevo?edit=${p.id}`}
                        className="px-3 py-1.5 rounded-md btn-block bg-white dark:bg-neutral-900"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id || isPending}
                        className="px-3 py-1.5 rounded-md bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                      >
                        {deleting === p.id ? "..." : "Eliminar"}
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
