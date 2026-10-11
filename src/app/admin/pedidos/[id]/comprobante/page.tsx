import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getStoreSettings } from "@/lib/actions/settings";
import { ComprobanteVenta } from "@/components/ComprobanteVenta";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function ComprobantePedidoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    prisma.order.findUnique({
      where: { id },
      include: { customer: true, items: { include: { variant: { include: { product: true } } } } },
    }),
    getStoreSettings(),
  ]);

  if (!order) notFound();

  return (
    <div>
      <div className="no-print mb-6">
        <PrintButton />
      </div>
      <ComprobanteVenta
        numero={order.numero}
        fecha={order.createdAt}
        cliente={{ nombre: order.customer.nombre, email: order.customer.email, rut: order.customer.rut }}
        items={order.items.map((item) => ({
          nombre: item.variant ? item.variant.product.nombre : (item.descripcionLibre ?? "Encargo personalizado"),
          detalle: item.variant
            ? `${item.variant.talle} / ${item.variant.color} — SKU ${item.variant.sku}`
            : `${item.tallaLibre ?? "—"} / ${item.colorLibre ?? "—"}`,
          cantidad: item.cantidad,
          precioUnit: Number(item.precioUnit),
        }))}
        subtotal={Number(order.subtotal)}
        costoEnvio={Number(order.costoEnvio)}
        descuento={Number(order.descuento)}
        total={Number(order.total)}
        emisor={{
          razonSocial: settings.razonSocial,
          rut: settings.rut,
          direccionLegal: settings.direccionLegal,
          emailContacto: settings.emailContacto,
        }}
      />
    </div>
  );
}
