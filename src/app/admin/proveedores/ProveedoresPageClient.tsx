"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface Supplier {
  id: string;
  nombre: string;
  contacto: string;
  leadTimeDias: number;
  costoBase: number | any;
  calificacion: number;
  batches: { id: string }[];
}

export default function ProveedoresPageClient({ proveedores }: { proveedores: Supplier[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este proveedor? Esta acción no se puede deshacer.")) return;
    setError("");
    setDeletingId(id);
    try {
      const { deleteSupplier } = await import("@/lib/actions/suppliers");
      await deleteSupplier(id);
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
        <h1 className="text-2xl font-bold">Proveedores</h1>
        <Link
          href="/admin/proveedores/nuevo"
          className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + Nuevo proveedor
        </Link>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <Card>
        {proveedores.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-neutral-400">No hay proveedores registrados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 dark:text-neutral-400 dark:border-neutral-700">
                <th className="p-4 pb-2">Nombre</th>
                <th className="p-4 pb-2">Contacto</th>
                <th className="p-4 pb-2 text-right">Lead time</th>
                <th className="p-4 pb-2 text-right">Costo base</th>
                <th className="p-4 pb-2 text-center">Calificación</th>
                <th className="p-4 pb-2 text-center">Lotes</th>
                <th className="p-4 pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id} className="border-b last:border-0 dark:border-neutral-700">
                  <td className="p-4">
                    <Link href={`/admin/proveedores/${p.id}`} className="font-medium hover:underline">
                      {p.nombre}
                    </Link>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-neutral-300">{p.contacto}</td>
                  <td className="p-4 text-right">{p.leadTimeDias} días</td>
                  <td className="p-4 text-right font-bold">${Number(p.costoBase).toFixed(2)}</td>
                  <td className="p-4 text-center">{"★".repeat(p.calificacion)}{"☆".repeat(5 - p.calificacion)}</td>
                  <td className="p-4 text-center">{p.batches.length}</td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/proveedores/nuevo?edit=${p.id}`}
                        className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-neutral-700 text-xs font-medium hover:bg-gray-50 dark:hover:bg-neutral-800"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id || isPending || p.batches.length > 0}
                        title={p.batches.length > 0 ? "No se puede eliminar: tiene lotes asociados" : undefined}
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
