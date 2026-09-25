import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ORDER_TRANSITIONS } from "@/lib/state-machines";
import { formatCLP, formatFechaCorta } from "@/lib/format";

export const dynamic = "force-dynamic";

const ESTADO_COLORS: Record<string, string> = {
  Pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Pagado: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  EnProduccion: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  ListoParaEnvio: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  Enviado: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  Entregado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Cancelado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const ESTADO_PAGO_COLORS: Record<string, string> = {
  PendienteTransferencia: "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-300",
  EnRevision: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Pagado: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Rechazado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  Reembolsado: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
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
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) notFound();

  const allowed = ORDER_TRANSITIONS[order.estado] ?? [];
  const pagoPendienteRevision = order.payments.find((p) => p.estado === "EnRevision");

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/pedidos" className="text-sm text-gray-500 dark:text-neutral-400 hover:underline">
          ← Volver a Pedidos
        </Link>
        <h1 className="text-2xl font-black mt-2 dark:text-neutral-100">
          Pedido #{String(order.numero).padStart(4, "0")}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-3">Información del Pedido</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Canal:</span> {order.canal}</p>
            <p><span className="font-medium">Fecha:</span> {formatFechaCorta(order.createdAt)}</p>
            <p><span className="font-medium">Subtotal:</span> {formatCLP(Number(order.subtotal))}</p>
            <p><span className="font-medium">Envío:</span> {formatCLP(Number(order.costoEnvio))}</p>
            {Number(order.descuento) > 0 && (
              <p><span className="font-medium">Descuento:</span> -{formatCLP(Number(order.descuento))}</p>
            )}
            <p><span className="font-medium">Total:</span> {formatCLP(Number(order.total))}</p>
            <p className="flex items-center gap-2">
              <span className="font-medium">Estado:</span>
              <Badge className={ESTADO_COLORS[order.estado] ?? ""}>{order.estado}</Badge>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium">Pago:</span>
              <Badge className={ESTADO_PAGO_COLORS[order.estadoPago] ?? ""}>{order.estadoPago}</Badge>
            </p>
            {order.pagadoAt && (
              <p><span className="font-medium">Pagado el:</span> {formatFechaCorta(order.pagadoAt)}</p>
            )}
            {order.fechaCompromiso && (
              <p><span className="font-medium">Compromiso de entrega:</span> {formatFechaCorta(order.fechaCompromiso)}</p>
            )}
            {order.notas && (
              <p><span className="font-medium">Notas:</span> {order.notas}</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-3">Cliente</h2>
          <div className="space-y-2 text-sm mb-4">
            <p><span className="font-medium">Nombre:</span> {order.customer.nombre}</p>
            <p><span className="font-medium">Email:</span> {order.customer.email}</p>
            <p><span className="font-medium">Teléfono:</span> {order.customer.telefono ?? "—"}</p>
          </div>
          <h3 className="text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-2">Dirección de envío</h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-neutral-300">
            <p>{order.envioNombre ?? "—"}</p>
            <p>{order.envioCalle} {order.envioNumero}, {order.envioComuna}, {order.envioRegion}</p>
            <p>{order.envioTelefono}</p>
            {order.metodoEnvio && <p className="text-xs mt-1">Método: {order.metodoEnvio}</p>}
          </div>
        </Card>
      </div>

      {order.payments.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-3">Comprobantes de pago</h2>
          <div className="space-y-4">
            {order.payments.map((payment) => (
              <div key={payment.id} className="border border-gray-200 dark:border-neutral-700 rounded-md p-4 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <Badge className={ESTADO_PAGO_COLORS[payment.estado] ?? ""}>{payment.estado}</Badge>
                  <span className="text-gray-400 dark:text-neutral-500 text-xs">
                    {formatFechaCorta(payment.createdAt)}
                  </span>
                </div>
                <p><span className="font-medium">Monto:</span> {formatCLP(Number(payment.monto))}</p>
                {payment.banco && <p><span className="font-medium">Banco:</span> {payment.banco}</p>}
                {payment.referencia && <p><span className="font-medium">Referencia:</span> {payment.referencia}</p>}
                {payment.comprobanteUrl && (
                  <p>
                    <a
                      href={payment.comprobanteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ajicolor-magenta hover:underline"
                    >
                      Ver comprobante
                    </a>
                  </p>
                )}
                {payment.estado === "EnRevision" && (
                  <div className="flex gap-2 mt-3">
                    <form action={async () => {
                      "use server";
                      const { confirmPayment } = await import("@/lib/actions/payments");
                      await confirmPayment(payment.id);
                    }}>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-md bg-ajicolor-green text-white text-xs font-medium hover:opacity-90"
                      >
                        Confirmar pago
                      </button>
                    </form>
                    <form action={async () => {
                      "use server";
                      const { rejectPayment } = await import("@/lib/actions/payments");
                      await rejectPayment(payment.id);
                    }}>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-md border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50"
                      >
                        Rechazar
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-3">Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-neutral-700 text-left text-gray-500 dark:text-neutral-400">
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
              <tr key={item.id} className="border-b dark:border-neutral-700 last:border-0">
                <td className="py-2">{item.variant.product.nombre}</td>
                <td className="py-2">{item.variant.talle} / {item.variant.color}</td>
                <td className="py-2 font-mono text-xs">{item.variant.sku}</td>
                <td className="py-2 text-right">{item.cantidad}</td>
                <td className="py-2 text-right">{formatCLP(Number(item.precioUnit))}</td>
                <td className="py-2 text-right font-medium">
                  {formatCLP(item.cantidad * Number(item.precioUnit))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {order.shipment && (
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-3">Envío</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Transportista:</span> {order.shipment.transportista ?? "—"}</p>
            <p><span className="font-medium">Tracking:</span> {order.shipment.trackingNumber ?? "—"}</p>
            <p><span className="font-medium">Estado:</span> {order.shipment.estado}</p>
            <p><span className="font-medium">Despacho:</span> {order.shipment.fechaDespacho ? formatFechaCorta(order.shipment.fechaDespacho) : "—"}</p>
            <p><span className="font-medium">Entrega estimada:</span> {order.shipment.fechaEstimada ? formatFechaCorta(order.shipment.fechaEstimada) : "—"}</p>
          </div>
        </Card>
      )}

      {allowed.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-3">Cambiar Estado</h2>
          {pagoPendienteRevision && allowed.includes("EnProduccion") && (
            <p className="text-xs text-ajicolor-magenta mb-3">
              Hay un comprobante pendiente de revisión — confírmalo arriba antes de pasar a producción.
            </p>
          )}
          <div className="flex gap-3 flex-wrap">
            {allowed.map((estado) => (
              <form key={estado} action={async (formData: FormData) => {
                "use server";
                const { updateOrderStatus } = await import("@/lib/actions/orders");
                await updateOrderStatus(id, estado);
              }}>
                <button
                  type="submit"
                  className="btn-block bg-ajicolor-magenta text-white"
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
