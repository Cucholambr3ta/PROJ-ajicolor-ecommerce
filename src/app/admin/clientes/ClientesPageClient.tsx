"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  backstagePass: boolean;
  totalGastado: number | any;
  _count: { orders: number };
}

export default function ClientesPageClient({ clientes }: { clientes: Customer[] }) {
  const router = useRouter();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
      </div>
      <Card>
        {clientes.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay clientes para mostrar.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="p-4 pb-2">Nombre</th>
                <th className="p-4 pb-2">Email</th>
                <th className="p-4 pb-2">Teléfono</th>
                <th className="p-4 pb-2 text-center">Pedidos</th>
                <th className="p-4 pb-2 text-right">Total Gastado</th>
                <th className="p-4 pb-2 text-center">Backstage</th>
                <th className="p-4 pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="p-4">
                    <Link href={`/admin/clientes/${c.id}`} className="font-medium hover:underline">
                      {c.nombre}
                    </Link>
                  </td>
                  <td className="p-4 text-gray-600">{c.email}</td>
                  <td className="p-4 text-gray-600">{c.telefono}</td>
                  <td className="p-4 text-center">{c._count.orders}</td>
                  <td className="p-4 text-right font-bold">${c.totalGastado.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    {c.backstagePass && <Badge>Backstage</Badge>}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/clientes/${c.id}`}
                      className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50"
                    >
                      Ver detalle
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
