import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

const BATCH_TRANSITIONS: Record<string, string[]> = {
  Solicitado: ["EnProgreso"],
  EnProgreso: ["Completado"],
  Completado: ["Recibido"],
  Recibido: [],
};

export default async function LoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const batch = await prisma.productionBatch.findUnique({ where: { id } });

  if (!batch) notFound();

  const allowed = BATCH_TRANSITIONS[batch.estado] ?? [];
  const variantesList = batch.variantes.split(",").map((v) => v.trim());
  const unidadesList = batch.unidadesPorVar.split(",").map((u) => u.trim());

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/produccion" className="text-sm text-gray-500 hover:underline">
          ← Volver a Producción
        </Link>
        <h1 className="text-2xl font-bold mt-2">Detalle del Lote</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Información del Lote</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">ID:</span> {batch.id}</p>
            <p><span className="font-medium">Proveedor:</span> {batch.proveedor}</p>
            <p className="flex items-center gap-2">
              <span className="font-medium">Estado:</span>
              <Badge variant="outline">{batch.estado}</Badge>
            </p>
            <p><span className="font-medium">Costo Total:</span> ${batch.costoTotal.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Fechas</h2>
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
        <h2 className="font-semibold text-gray-700 mb-3">Variantes</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2">Variante</th>
              <th className="pb-2 text-right">Unidades</th>
            </tr>
          </thead>
          <tbody>
            {variantesList.map((v, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2">{v}</td>
                <td className="py-2 text-right">{unidadesList[i] ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {allowed.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Cambiar Estado</h2>
          <div className="flex gap-3 flex-wrap">
            {allowed.map((estado) => (
              <form key={estado} action={async (formData: FormData) => {
                "use server";
                const { updateBatchStatus } = await import("@/lib/actions/production");
                await updateBatchStatus(id, estado);
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
