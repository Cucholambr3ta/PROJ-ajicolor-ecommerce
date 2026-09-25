import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { revalidatePath } from "next/cache";

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
        <Link href="/admin/envios" className="text-sm text-gray-500 hover:underline dark:text-neutral-400">
          ← Volver a Envíos
        </Link>
        <h1 className="text-2xl font-black mt-2 dark:text-neutral-100">Detalle del Envío</h1>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-4 dark:text-neutral-200">Timeline</h2>
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
                        : "bg-gray-200 text-gray-500 dark:bg-neutral-700 dark:text-neutral-400"
                    } ${isCurrent ? "ring-2 ring-ajicolor-magenta ring-offset-2" : ""}`}
                  >
                    {done ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs mt-1 whitespace-nowrap ${done ? "text-gray-800 font-medium dark:text-neutral-100" : "text-gray-400 dark:text-neutral-500"}`}>
                    {step}
                  </span>
                </div>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 ${
                      i < currentIdx ? "bg-ajicolor-magenta" : "bg-gray-200 dark:bg-neutral-700"
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
          <h2 className="font-semibold text-gray-700 mb-3 dark:text-neutral-200">Información del Envío</h2>
          <p className="text-sm mb-2"><span className="font-medium">ID:</span> {shipment.id}</p>
          <p className="text-sm mb-4 flex items-center gap-2">
            <span className="font-medium">Estado:</span> <Badge variant="outline">{shipment.estado}</Badge>
          </p>
          <form
            action={async (formData: FormData) => {
              "use server";
              const { updateShipmentDetails } = await import("@/lib/actions/shipments");
              const costoRaw = formData.get("costo");
              await updateShipmentDetails(shipment.id, {
                transportista: String(formData.get("transportista") ?? "") || undefined,
                trackingNumber: String(formData.get("trackingNumber") ?? "") || undefined,
                costo: costoRaw ? parseFloat(String(costoRaw)) : undefined,
              });
              revalidatePath(`/admin/envios/${shipment.id}`);
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Transportista</label>
              <input
                name="transportista"
                defaultValue={shipment.transportista ?? ""}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Número de tracking</label>
              <input
                name="trackingNumber"
                defaultValue={shipment.trackingNumber ?? ""}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Costo</label>
              <input
                name="costo"
                type="number"
                min={0}
                step="0.01"
                defaultValue={shipment.costo != null ? Number(shipment.costo) : ""}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md bg-ajicolor-magenta text-white text-xs font-medium hover:opacity-90"
            >
              Guardar cambios
            </button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3 dark:text-neutral-200">Fechas</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Creación:</span> {shipment.createdAt.toLocaleDateString()}</p>
            <p><span className="font-medium">Despacho:</span> {shipment.fechaDespacho?.toLocaleDateString() ?? "—"}</p>
            <p><span className="font-medium">Estimada:</span> {shipment.fechaEstimada?.toLocaleDateString() ?? "—"}</p>
            <p><span className="font-medium">Entrega:</span> {shipment.fechaEntrega?.toLocaleDateString() ?? "—"}</p>
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3 dark:text-neutral-200">Cliente</h2>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Nombre:</span> {shipment.order.customer.nombre}</p>
          <p><span className="font-medium">Email:</span> {shipment.order.customer.email}</p>
          <p><span className="font-medium">Teléfono:</span> {shipment.order.customer.telefono}</p>
          <p><span className="font-medium">Dirección:</span> {shipment.order.customer.direccion}</p>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-700 mb-3 dark:text-neutral-200">Items del Pedido</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
              <th className="pb-2">Producto</th>
              <th className="pb-2">Talle / Color</th>
              <th className="pb-2 text-right">Cant.</th>
              <th className="pb-2 text-right">Precio</th>
            </tr>
          </thead>
          <tbody>
            {shipment.order.items.map((item) => (
              <tr key={item.id} className="border-b last:border-0 dark:border-neutral-700">
                <td className="py-2">{item.variant.product.nombre}</td>
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
