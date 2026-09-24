import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BATCH_TRANSITIONS } from "@/lib/state-machines";

export const dynamic = "force-dynamic";

export default async function LoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const batch = await prisma.productionBatch.findUnique({
    where: { id },
    include: { supplier: true, items: { include: { variant: { include: { product: true } } } } },
  });

  if (!batch) notFound();

  const allowed = BATCH_TRANSITIONS[batch.estado] ?? [];

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/produccion" className="text-sm text-gray-500 dark:text-neutral-400 hover:underline">
          ← Volver a Producción
        </Link>
        <h1 className="text-2xl font-black mt-2 dark:text-neutral-100">Detalle del Lote</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-3">Información del Lote</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">ID:</span> {batch.id}</p>
            <p>
              <span className="font-medium">Proveedor:</span>{" "}
              <Link href={`/admin/proveedores/${batch.supplier.id}`} className="text-ajicolor-magenta hover:underline">
                {batch.supplier.nombre}
              </Link>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium">Estado:</span>
              <Badge variant="outline">{batch.estado}</Badge>
            </p>
            <p><span className="font-medium">Costo Total:</span> ${batch.costoTotal.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-3">Fechas</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Fecha de Pedido:</span> {batch.fechaPedido.toLocaleDateString()}</p>
            <p><span className="font-medium">Fecha Estimada:</span> {batch.fechaEstimada.toLocaleDateString()}</p>
            <p>
              <span className="font-medium">Fecha de Recepción:</span>{" "}
              {batch.fechaRecepcion?.toLocaleDateString() ?? "—"}
            </p>
            <p><span className="font-medium">Creado:</span> {batch.createdAt.toLocaleDateString()}</p>
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-3">Variantes</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b dark:border-neutral-700 text-left text-gray-500 dark:text-neutral-400">
              <th className="pb-2">Variante</th>
              <th className="pb-2 text-right">Unidades</th>
              <th className="pb-2 text-right">Costo unit.</th>
            </tr>
          </thead>
          <tbody>
            {batch.items.map((item) => (
              <tr key={item.id} className="border-b dark:border-neutral-700 last:border-0">
                <td className="py-2">
                  {item.variant.product.nombreSlug} — {item.variant.color} / {item.variant.talle}
                </td>
                <td className="py-2 text-right">{item.cantidad}</td>
                <td className="py-2 text-right">${item.costoUnitario.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {allowed.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-3">Cambiar Estado</h2>
          <div className="flex gap-3 flex-wrap">
            {allowed.map((estado) => (
              <form key={estado} action={async (formData: FormData) => {
                "use server";
                const { updateBatchStatus } = await import("@/lib/actions/production");
                await updateBatchStatus(id, estado);
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
