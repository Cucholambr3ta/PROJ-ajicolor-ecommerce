"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ESTADOS = ["Todos", "Preparando", "Despachado", "EnTransito", "Entregado", "Devuelto"];

const ESTADO_COLORS: Record<string, string> = {
  Preparando: "bg-yellow-100 text-yellow-800",
  Despachado: "bg-blue-100 text-blue-800",
  EnTransito: "bg-purple-100 text-purple-800",
  Entregado: "bg-green-100 text-green-800",
  Devuelto: "bg-red-100 text-red-800",
};

interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string | null;
  transportista: string | null;
  estado: string;
  fechaDespacho: any;
  fechaEstimada: any;
  fechaEntrega: any;
  order: {
    id: string;
    customer: { nombre: string };
  };
}

export default function EnviosPageClient({
  envios,
  filtro,
}: {
  envios: Shipment[];
  filtro: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const NEXT: Record<string, string> = {
    Preparando: "Despachado",
    Despachado: "EnTransito",
    EnTransito: "Entregado",
  };

  async function handleAdvanceStatus(id: string, next: string) {
    setUpdatingId(id);
    const { updateShipmentStatus } = await import("@/lib/actions/shipments");
    const data: Record<string, Date> = {};
    if (next === "Despachado") data.fechaDespacho = new Date();
    if (next === "Entregado") data.fechaEntrega = new Date();
    await updateShipmentStatus(id, next, data);
    setUpdatingId(null);
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Envíos</h1>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {ESTADOS.map((e) => (
          <Link
            key={e}
            href={e === "Todos" ? "/admin/envios" : `/admin/envios?estado=${e}`}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              filtro === e || (!filtro && e === "Todos")
                ? "bg-ajicolor-magenta text-white border-transparent"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {e}
          </Link>
        ))}
      </div>
      <Card>
        {envios.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay envíos para mostrar.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="p-4 pb-2">Cliente</th>
                <th className="p-4 pb-2">Transportista</th>
                <th className="p-4 pb-2">Tracking</th>
                <th className="p-4 pb-2 text-center">Estado</th>
                <th className="p-4 pb-2 text-right">Despacho</th>
                <th className="p-4 pb-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {envios.map((env) => {
                const next = NEXT[env.estado];
                return (
                  <tr key={env.id} className="border-b last:border-0">
                    <td className="p-4">
                      <Link href={`/admin/envios/${env.id}`} className="font-medium hover:underline">
                        {env.order.customer.nombre}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-600">{env.transportista ?? "—"}</td>
                    <td className="p-4 font-mono text-xs text-gray-600">{env.trackingNumber ?? "—"}</td>
                    <td className="p-4 text-center">
                      <Badge className={ESTADO_COLORS[env.estado] ?? ""}>{env.estado}</Badge>
                    </td>
                    <td className="p-4 text-right text-gray-600">
                      {env.fechaDespacho
                        ? new Date(env.fechaDespacho).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {next && (
                          <button
                            onClick={() => handleAdvanceStatus(env.id, next)}
                            disabled={updatingId === env.id || isPending}
                            className="px-3 py-1.5 rounded-md bg-ajicolor-magenta text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            → {next}
                          </button>
                        )}
                        <Link
                          href={`/admin/envios/${env.id}`}
                          className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50"
                        >
                          Detalle
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
