"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  nombreSlug: string;
  descripcion: string;
  artista: string;
  temporada: string;
  variants: { id: string; talle: string; color: string; stock: number }[];
}

export default function CatalogoPageClient({ productos }: { productos: Product[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este producto y todas sus variantes?")) return;
    setDeleting(id);
    const { deleteProduct } = await import("@/lib/actions/products");
    await deleteProduct(id);
    setDeleting(null);
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Catálogo</h1>
        <Link
          href="/admin/catalogo/nuevo"
          className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Nuevo producto
        </Link>
      </div>
      <Card>
        {productos.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay productos para mostrar.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="p-4 pb-2">Producto</th>
                <th className="p-4 pb-2">Artista</th>
                <th className="p-4 pb-2">Temporada</th>
                <th className="p-4 pb-2 text-center">Variantes</th>
                <th className="p-4 pb-2 text-center">Stock total</th>
                <th className="p-4 pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-4">
                    <Link href={`/admin/catalogo/${p.id}`} className="font-medium hover:underline">
                      {p.nombreSlug}
                    </Link>
                    <p className="text-xs text-gray-400 line-clamp-1">{p.descripcion}</p>
                  </td>
                  <td className="p-4 text-gray-600">{p.artista}</td>
                  <td className="p-4 text-gray-600">{p.temporada}</td>
                  <td className="p-4 text-center">
                    <Badge variant="outline">{p.variants.length}</Badge>
                  </td>
                  <td className="p-4 text-center font-medium">
                    {p.variants.reduce((acc, v) => acc + v.stock, 0)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/catalogo/${p.id}`}
                        className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deleting === p.id || isPending}
                        className="px-3 py-1.5 rounded-md bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
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
