"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface SupplierData {
  id: string;
  nombre: string;
  contacto: string;
  leadTimeDias: number;
  costoBase: number;
  calificacion: number;
}

export default function ProveedorFormClient({ initialData }: { initialData?: SupplierData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!initialData;

  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [contacto, setContacto] = useState(initialData?.contacto ?? "");
  const [leadTimeDias, setLeadTimeDias] = useState(initialData?.leadTimeDias ?? 15);
  const [costoBase, setCostoBase] = useState(initialData?.costoBase ?? 0);
  const [calificacion, setCalificacion] = useState(initialData?.calificacion ?? 3);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !contacto.trim()) {
      setError("Nombre y contacto son obligatorios");
      return;
    }

    try {
      const { createSupplier, updateSupplier } = await import("@/lib/actions/suppliers");
      if (isEdit) {
        await updateSupplier(initialData.id, { nombre, contacto, leadTimeDias, costoBase, calificacion });
      } else {
        await createSupplier({ nombre, contacto, leadTimeDias, costoBase, calificacion });
      }
      startTransition(() => router.push("/admin/proveedores"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/proveedores" className="text-sm text-gray-500 dark:text-neutral-400 hover:underline">
          ← Volver a Proveedores
        </Link>
        <h1 className="text-2xl font-bold mt-2">{isEdit ? "Editar Proveedor" : "Nuevo Proveedor"}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">Contacto *</label>
              <input
                type="text"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                placeholder="Email o teléfono"
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">Lead time (días)</label>
              <input
                type="number"
                min={0}
                value={leadTimeDias}
                onChange={(e) => setLeadTimeDias(parseInt(e.target.value) || 0)}
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">Costo base</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={costoBase}
                onChange={(e) => setCostoBase(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-neutral-200 mb-1">Calificación (1-5)</label>
              <select
                value={calificacion}
                onChange={(e) => setCalificacion(parseInt(e.target.value))}
                className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link
            href="/admin/proveedores"
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-neutral-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear proveedor"}
          </button>
        </div>
      </form>
    </div>
  );
}
