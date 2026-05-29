import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const TRANSITIONS: Record<string, string[]> = {
  Pendiente: ["Confirmado", "Cancelado"],
  Confirmado: ["EnProduccion", "Cancelado"],
  EnProduccion: ["Enviado", "Cancelado"],
  Enviado: ["Entregado"],
  Entregado: [],
  Cancelado: [],
};

const ESTADO_COLORS: Record<string, string> = {
  Pendiente: "bg-yellow-100 text-yellow-800",
  Confirmado: "bg-blue-100 text-blue-800",
  EnProduccion: "bg-purple-100 text-purple-800",
  Enviado: "bg-indigo-100 text-indigo-800",
  Entregado: "bg-green-100 text-green-800",
  Cancelado: "bg-red-100 text-red-800",
};

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { variant: { include: { product: true } } } },
      shipment: true,
    },
  });

  if (!order) notFound();

  const allowed = TRANSITIONS[order.estado] ?? [];

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/pedidos" className="text-sm text-gray-500 hover:underline">
          ← Volver a Pedidos
        </Link>
        <h1 className="text-2xl font-bold mt-2">Detalle del Pedido</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Información del Pedido</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">ID:</span> {order.id}</p>
            <p><span className="font-medium">Canal:</span> {order.canal}</p>
            <p><span className="font-medium">Fecha:</span> {order.createdAt.toLocaleDateString()}</p>
            <p><span className="font-medium">Total:</span> ${order.total.toFixed(2)}</p>
            <p className="flex items-center gap-2">
              <span className="font-medium">Estado:</span>
              <Badge className={ESTADO_COLORS[order.estado] ?? ""}>{order.estado}</Badge>
            </p>
            {order.notas && (
              <p><span className="font-medium">Notas:</span> {order.notas}</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Cliente</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Nombre:</span> {order.customer.nombre}</p>
            <p><span className="font-medium">Email:</span> {order.customer.email}</p>
            <p><span className="font-medium">Teléfono:</span> {order.customer.telefono}</p>
            <p><span className="font-medium">Dirección:</span> {order.customer.direccion}</p>
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2">Producto</th>
              <th className="pb-2">Talle / Color</th>
              <th className="pb-2">SKU</th>
              <th className="pb-2 text-right">Cant.</th>
              <th className="pb-2 text-right">Precio</th>
              <th className="pb-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b last:border-0">
                <td className="py-2">{item.variant.product.nombreSlug}</td>
                <td className="py-2">{item.variant.talle} / {item.variant.color}</td>
                <td className="py-2 font-mono text-xs">{item.variant.sku}</td>
                <td className="py-2 text-right">{item.cantidad}</td>
                <td className="py-2 text-right">${Number(item.precioUnit).toFixed(2)}</td>
                <td className="py-2 text-right font-medium">
                  ${(item.cantidad * Number(item.precioUnit)).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {order.shipment && (
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">Envío</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Transportista:</span> {order.shipment.transportista ?? "—"}</p>
            <p><span className="font-medium">Tracking:</span> {order.shipment.trackingNumber ?? "—"}</p>
            <p><span className="font-medium">Estado:</span> {order.shipment.estado}</p>
            <p><span className="font-medium">Despacho:</span> {order.shipment.fechaDespacho?.toLocaleDateString() ?? "—"}</p>
            <p><span className="font-medium">Entrega estimada:</span> {order.shipment.fechaEstimada?.toLocaleDateString() ?? "—"}</p>
          </div>
        </Card>
      )}

      {allowed.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Cambiar Estado</h2>
          <div className="flex gap-3 flex-wrap">
            {allowed.map((estado) => (
              <form key={estado} action={async (formData: FormData) => {
                "use server";
                const { updateOrderStatus } = await import("@/lib/actions/orders");
                await updateOrderStatus(id, estado);
              }}>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  → {estado}
                </button>
              </form>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
