import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TIMELINE_STEPS = ["Preparando", "Despachado", "EnTransito", "Entregado"];

export default async function EnvioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shipment = await prisma.shipment.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          customer: true,
          items: { include: { variant: { include: { product: true } } } },
        },
      },
    },
  });

  if (!shipment) notFound();

  const currentIdx = TIMELINE_STEPS.indexOf(shipment.estado);

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/envios" className="text-sm text-gray-500 hover:underline">
          ← Volver a Envíos
        </Link>
        <h1 className="text-2xl font-bold mt-2">Detalle del Envío</h1>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Timeline</h2>
        <div className="flex items-center gap-0">
          {TIMELINE_STEPS.map((step, i) => {
            const done = i <= currentIdx;
            const isCurrent = i === currentIdx;
            return (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      done
                        ? "bg-ajicolor-magenta text-white"
                        : "bg-gray-200 text-gray-500"
                    } ${isCurrent ? "ring-2 ring-ajicolor-magenta ring-offset-2" : ""}`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs mt-1 whitespace-nowrap ${done ? "text-gray-800 font-medium" : "text-gray-400"}`}>
                    {step}
                  </span>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 ${
                      i < currentIdx ? "bg-ajicolor-magenta" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Información del Envío</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">ID:</span> {shipment.id}</p>
            <p><span className="font-medium">Estado:</span> <Badge variant="outline">{shipment.estado}</Badge></p>
            <p><span className="font-medium">Transportista:</span> {shipment.transportista ?? "—"}</p>
            <p><span className="font-medium">Tracking:</span> {shipment.trackingNumber ?? "—"}</p>
            <p><span className="font-medium">Costo:</span> {shipment.costo != null ? `$${Number(shipment.costo).toFixed(2)}` : "—"}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Fechas</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Creación:</span> {shipment.createdAt.toLocaleDateString()}</p>
            <p><span className="font-medium">Despacho:</span> {shipment.fechaDespacho?.toLocaleDateString() ?? "—"}</p>
            <p><span className="font-medium">Estimada:</span> {shipment.fechaEstimada?.toLocaleDateString() ?? "—"}</p>
            <p><span className="font-medium">Entrega:</span> {shipment.fechaEntrega?.toLocaleDateString() ?? "—"}</p>
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Cliente</h2>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Nombre:</span> {shipment.order.customer.nombre}</p>
          <p><span className="font-medium">Email:</span> {shipment.order.customer.email}</p>
          <p><span className="font-medium">Teléfono:</span> {shipment.order.customer.telefono}</p>
          <p><span className="font-medium">Dirección:</span> {shipment.order.customer.direccion}</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-700 mb-3">Items del Pedido</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2">Producto</th>
              <th className="pb-2">Talle / Color</th>
              <th className="pb-2 text-right">Cant.</th>
              <th className="pb-2 text-right">Precio</th>
            </tr>
          </thead>
          <tbody>
            {shipment.order.items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-2">{item.variant.product.nombreSlug}</td>
                <td className="py-2">{item.variant.talle} / {item.variant.color}</td>
                <td className="py-2 text-right">{item.cantidad}</td>
                <td className="py-2 text-right">${Number(item.precioUnit).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
