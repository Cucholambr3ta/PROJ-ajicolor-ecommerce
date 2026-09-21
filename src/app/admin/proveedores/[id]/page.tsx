import { notFound } from "next/navigation";
import { getSupplierById } from "@/lib/actions/suppliers";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProveedorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supplier = await getSupplierById(id);

  if (!supplier) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/proveedores" className="text-sm text-gray-500 hover:underline">
          ← Volver a Proveedores
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold">{supplier.nombre}</h1>
          <Link
            href={`/admin/proveedores/nuevo?edit=${supplier.id}`}
            className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Editar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Información</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Contacto:</span> {supplier.contacto}</p>
            <p><span className="font-medium">Lead time:</span> {supplier.leadTimeDias} días</p>
            <p><span className="font-medium">Costo base:</span> ${Number(supplier.costoBase).toFixed(2)}</p>
            <p>
              <span className="font-medium">Calificación:</span>{" "}
              {"★".repeat(supplier.calificacion)}{"☆".repeat(5 - supplier.calificacion)}
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Resumen</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Lotes totales:</span> {supplier.batches.length}</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-700 mb-3">Historial de lotes</h2>
        {supplier.batches.length === 0 ? (
          <p className="text-sm text-gray-500">Sin lotes registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">Fecha pedido</th>
                <th className="pb-2 text-right">Costo</th>
                <th className="pb-2 text-right">Estado</th>
                <th className="pb-2 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {supplier.batches.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="py-2">{b.fechaPedido.toLocaleDateString()}</td>
                  <td className="py-2 text-right font-medium">${Number(b.costoTotal).toFixed(2)}</td>
                  <td className="py-2 text-right"><Badge variant="outline">{b.estado}</Badge></td>
                  <td className="py-2 text-right">
                    <Link href={`/admin/produccion/${b.id}`} className="text-ajicolor-magenta hover:underline text-xs">
                      Ver
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
