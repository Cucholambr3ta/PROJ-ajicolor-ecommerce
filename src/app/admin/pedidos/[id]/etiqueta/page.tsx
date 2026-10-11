import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EtiquetaEnvio } from "@/components/EtiquetaEnvio";
import PrintButton from "@/components/PrintButton";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const METODO_ENVIO_LABELS: Record<string, string> = {
  CorreosSucursal: "Correos de Chile — Retiro en sucursal",
  StarkenPorPagar: "Starken — Por pagar",
  MetroL1: "Metro Línea 1",
};

export default async function EtiquetaPedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ print?: string }>;
}) {
  const { id } = await params;
  const { print } = await searchParams;
  const esParaImprimir = print === "1";

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { variant: { include: { product: true } } } },
      shipment: true,
    },
  });

  if (!order) notFound();

  const etiqueta = (
    <EtiquetaEnvio
      numero={order.numero}
      fecha={order.createdAt}
      cliente={{ nombre: order.customer.nombre, email: order.customer.email }}
      items={order.items.map((item) => ({
        nombre: item.variant ? item.variant.product.nombre : (item.descripcionLibre ?? "Encargo personalizado"),
        talle: item.variant ? item.variant.talle : (item.tallaLibre ?? "—"),
        color: item.variant ? item.variant.color : (item.colorLibre ?? "—"),
        cantidad: item.cantidad,
        imagenUrl: item.variant ? item.variant.product.disenoUrl : (item.disenoUrlLibre ?? null),
      }))}
      envio={{
        nombre: order.envioNombre,
        telefono: order.envioTelefono,
        calle: order.envioCalle,
        numero: order.envioNumero,
        comuna: order.envioComuna,
        region: order.envioRegion,
      }}
      metodoEnvioLabel={order.metodoEnvio ? METODO_ENVIO_LABELS[order.metodoEnvio] : null}
      shipmentExtra={
        order.shipment
          ? {
              sucursal: order.shipment.sucursal,
              estacionMetro: order.shipment.estacionMetro,
              porPagar: order.shipment.porPagar,
            }
          : null
      }
    />
  );

  // Cuando se carga dentro del iframe oculto de ImprimirEtiquetaButton
  // (?print=1), se omite toda la navegación/tarjeta de pantalla — ese
  // iframe nunca se ve, solo sirve para imprimir, así que ese chrome es
  // DOM de sobra. Visitando la URL directo (sin el parámetro) se sigue
  // viendo la página completa, por si se necesita revisar/imprimir a mano.
  if (esParaImprimir) {
    return <div>{etiqueta}</div>;
  }

  return (
    <div>
      <div className="no-print mb-6">
        <Link href={`/admin/pedidos/${order.id}`} className="text-sm text-gray-500 dark:text-neutral-400 hover:underline">
          ← Volver al pedido
        </Link>
        <div className="mt-2">
          <PrintButton />
        </div>
      </div>
      <Card className="etiqueta-card p-8">{etiqueta}</Card>
    </div>
  );
}
