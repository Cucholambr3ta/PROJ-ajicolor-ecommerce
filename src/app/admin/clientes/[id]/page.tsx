import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          items: { include: { variant: { include: { product: true } } } },
          shipment: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/clientes" className="text-sm text-gray-500 hover:underline">
          ← Volver a Clientes
        </Link>
        <h1 className="text-2xl font-bold mt-2">Detalle del Cliente</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Información del Cliente</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">ID:</span> {customer.id}</p>
            <p><span className="font-medium">Nombre:</span> {customer.nombre}</p>
            <p><span className="font-medium">Email:</span> {customer.email}</p>
            <p><span className="font-medium">Teléfono:</span> {customer.telefono}</p>
            <p><span className="font-medium">Dirección:</span> {customer.direccion}</p>
            <p><span className="font-medium">Registro:</span> {customer.fechaRegistro.toLocaleDateString()}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Resumen</h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <span className="font-medium">Backstage Pass:</span>
              {customer.backstagePass ? <Badge>Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}
            </p>
            <p><span className="font-medium">Total gastado:</span> <span className="font-bold text-lg">${customer.totalGastado.toFixed(2)}</span></p>
            <p><span className="font-medium">Total pedidos:</span> {customer.orders.length}</p>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-700 mb-3">Historial de Pedidos</h2>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-gray-500">No hay pedidos registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Canal</th>
                <th className="pb-2">Items</th>
                <th className="pb-2 text-right">Total</th>
                <th className="pb-2 text-center">Estado</th>
                <th className="pb-2 text-center">Envío</th>
                <th className="pb-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="py-2">{o.createdAt.toLocaleDateString()}</td>
                  <td className="py-2">{o.canal}</td>
                  <td className="py-2">{o.items.length} item(s)</td>
                  <td className="py-2 text-right font-medium">${Number(o.total).toFixed(2)}</td>
                  <td className="py-2 text-center">
                    <Badge variant="outline">{o.estado}</Badge>
                  </td>
                  <td className="py-2 text-center">
                    {o.shipment ? (
                      <Badge variant="secondary">{o.shipment.estado}</Badge>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="text-ajicolor-magenta text-xs font-medium hover:underline"
                    >
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
