import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  backstagePass: boolean;
  totalGastado: number | any;
  _count: { orders: number };
}

export default function ClientesPageClient({
  clientes,
  q,
  page,
  totalPages,
}: {
  clientes: Customer[];
  q: string;
  page: number;
  totalPages: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Clientes</h1>
      </div>

      <form action="/admin/clientes" className="flex gap-2 mb-4">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o email..."
          className="flex-1 border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-900"
        />
        <button type="submit" className="px-4 py-2 rounded-md border border-gray-300 dark:border-neutral-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800">
          Buscar
        </button>
      </form>

      <Card>
        {clientes.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-neutral-400">No hay clientes para mostrar.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
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
                <tr key={c.id} className="border-b last:border-0 dark:border-neutral-700">
                  <td className="p-4">
                    <Link href={`/admin/clientes/${c.id}`} className="font-medium hover:underline">
                      {c.nombre}
                    </Link>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-neutral-300">{c.email}</td>
                  <td className="p-4 text-gray-600 dark:text-neutral-300">{c.telefono}</td>
                  <td className="p-4 text-center">{c._count.orders}</td>
                  <td className="p-4 text-right font-bold">${c.totalGastado.toFixed(2)}</td>
                  <td className="p-4 text-center">
                    {c.backstagePass && <Badge>Backstage</Badge>}
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/admin/clientes/${c.id}`}
                      className="px-3 py-1.5 rounded-md btn-block bg-white dark:bg-neutral-900"
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-6">
          <Link
            href={`/admin/clientes?${new URLSearchParams({ ...(q ? { q } : {}), page: String(Math.max(1, page - 1)) })}`}
            aria-disabled={page <= 1}
            className={`px-4 py-2 text-xs font-bold uppercase border rounded-md ${page <= 1 ? "pointer-events-none opacity-30" : "hover:bg-gray-50 dark:hover:bg-neutral-800"}`}
          >
            Anterior
          </Link>
          <span className="text-sm px-3">
            Página {page} de {totalPages}
          </span>
          <Link
            href={`/admin/clientes?${new URLSearchParams({ ...(q ? { q } : {}), page: String(Math.min(totalPages, page + 1)) })}`}
            aria-disabled={page >= totalPages}
            className={`px-4 py-2 text-xs font-bold uppercase border rounded-md ${page >= totalPages ? "pointer-events-none opacity-30" : "hover:bg-gray-50 dark:hover:bg-neutral-800"}`}
          >
            Siguiente
          </Link>
        </div>
      )}
    </div>
  );
}
