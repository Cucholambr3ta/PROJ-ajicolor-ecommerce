"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

interface Review {
  id: string;
  calificacion: number;
  comentario: string | null;
  createdAt: Date;
  customer: { nombre: string; email: string };
  product: { nombre: string };
}

export default function ResenasPageClient({ resenas }: { resenas: Review[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleApprove(id: string) {
    const { approveReview } = await import("@/lib/actions/reviews");
    await approveReview(id);
    startTransition(() => router.refresh());
  }

  async function handleReject(id: string) {
    if (!confirm("¿Rechazar y eliminar esta reseña?")) return;
    const { rejectReview } = await import("@/lib/actions/reviews");
    await rejectReview(id);
    startTransition(() => router.refresh());
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reseñas pendientes</h1>

      {resenas.length === 0 ? (
        <Card className="p-8 text-center text-gray-500 dark:text-neutral-400">
          No hay reseñas pendientes de moderación.
        </Card>
      ) : (
        <div className="space-y-4">
          {resenas.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold">{r.product.nombre}</p>
                  <p className="text-xs text-gray-500 dark:text-neutral-400">
                    {r.customer.nombre} ({r.customer.email}) · {new Date(r.createdAt).toLocaleDateString("es-CL")}
                  </p>
                </div>
                <span className="text-ajicolor-magenta font-bold">
                  {"★".repeat(r.calificacion)}
                  {"☆".repeat(5 - r.calificacion)}
                </span>
              </div>
              {r.comentario && <p className="text-sm text-gray-700 dark:text-neutral-300 mb-4">{r.comentario}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(r.id)}
                  disabled={isPending}
                  className="px-3 py-1.5 rounded-md bg-ajicolor-green text-white text-xs font-medium hover:opacity-90"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleReject(r.id)}
                  disabled={isPending}
                  className="px-3 py-1.5 rounded-md border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50"
                >
                  Rechazar
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
