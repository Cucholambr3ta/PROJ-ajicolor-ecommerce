"use client";

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
      <Card>
        {proveedores.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay proveedores registrados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
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
                <tr key={p.id} className="border-b last:border-0">
                  <td className="p-4">
                    <Link href={`/admin/proveedores/${p.id}`} className="font-medium hover:underline">
                      {p.nombre}
                    </Link>
                  </td>
                  <td className="p-4 text-gray-600">{p.contacto}</td>
                  <td className="p-4 text-right">{p.leadTimeDias} días</td>
                  <td className="p-4 text-right font-bold">${Number(p.costoBase).toFixed(2)}</td>
                  <td className="p-4 text-center">{"★".repeat(p.calificacion)}{"☆".repeat(5 - p.calificacion)}</td>
                  <td className="p-4 text-center">{p.batches.length}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/proveedores/nuevo?edit=${p.id}`}
                      className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50"
                    >
                      Editar
                    </Link>
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
