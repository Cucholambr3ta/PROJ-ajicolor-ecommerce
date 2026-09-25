import { getAuditLog } from "@/lib/actions/audit-log";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;
  const { items, total, totalPages } = await getAuditLog(page);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Auditoría</h1>
        <span className="text-sm text-gray-500 dark:text-neutral-400">{total} eventos</span>
      </div>

      <Card>
        {items.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-neutral-400">Sin eventos registrados.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 dark:text-neutral-400 dark:border-neutral-700">
                <th className="p-4 pb-2">Fecha</th>
                <th className="p-4 pb-2">Usuario</th>
                <th className="p-4 pb-2">Entidad</th>
                <th className="p-4 pb-2">Acción</th>
                <th className="p-4 pb-2">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <tr key={log.id} className="border-b last:border-0 dark:border-neutral-700">
                  <td className="p-4 text-gray-500 dark:text-neutral-400 whitespace-nowrap">
                    {log.createdAt.toLocaleString("es-CL")}
                  </td>
                  <td className="p-4">{log.user?.email ?? "—"}</td>
                  <td className="p-4 font-medium">
                    {log.entidad} <span className="text-gray-400 font-mono text-xs">#{log.entidadId.slice(-6)}</span>
                  </td>
                  <td className="p-4">{log.accion}</td>
                  <td className="p-4 font-mono text-xs text-gray-500 dark:text-neutral-400 max-w-xs truncate">
                    {log.payload ?? "—"}
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
            href={`/admin/auditoria?page=${Math.max(1, page - 1)}`}
            aria-disabled={page <= 1}
            className={`px-4 py-2 text-xs font-bold uppercase border rounded-md ${page <= 1 ? "pointer-events-none opacity-30" : "hover:bg-gray-50 dark:hover:bg-neutral-800"}`}
          >
            Anterior
          </Link>
          <span className="text-sm px-3">
            Página {page} de {totalPages}
          </span>
          <Link
            href={`/admin/auditoria?page=${Math.min(totalPages, page + 1)}`}
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
