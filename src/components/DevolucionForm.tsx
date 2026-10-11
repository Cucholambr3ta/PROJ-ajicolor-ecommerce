"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function DevolucionForm({ shipmentId, total }: { shipmentId: string; total: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [resolucion, setResolucion] = useState<"Reembolso" | "Cambio">("Reembolso");
  const [montoReembolsado, setMontoReembolsado] = useState<number>(total);
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const { marcarDevolucion } = await import("@/lib/actions/shipments");
    try {
      await marcarDevolucion(shipmentId, {
        motivo,
        resolucion,
        montoReembolsado: resolucion === "Reembolso" ? montoReembolsado : undefined,
        notas: notas || undefined,
      });
      setOpen(false);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar la devolución");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-md border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50"
      >
        Marcar devolución
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-3 border-2 border-red-200 rounded-md p-4 bg-red-50/50 dark:bg-red-950/20">
      <h3 className="font-bold text-sm">Registrar devolución</h3>
      <div>
        <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Motivo *</label>
        <input
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          required
          placeholder="Ej: Talla equivocada, producto defectuoso..."
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Resolución</label>
        <select
          value={resolucion}
          onChange={(e) => setResolucion(e.target.value as "Reembolso" | "Cambio")}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="Reembolso">Reembolso</option>
          <option value="Cambio">Cambio por otra prenda</option>
        </select>
      </div>
      {resolucion === "Reembolso" && (
        <div>
          <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Monto a reembolsar</label>
          <input
            type="number"
            min={0}
            value={montoReembolsado}
            onChange={(e) => setMontoReembolsado(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">
            Se descuenta del total gastado del cliente. La transferencia real la hacés vos aparte.
          </p>
        </div>
      )}
      <div>
        <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Notas (opcional)</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-neutral-700 text-xs font-medium"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Confirmar devolución"}
        </button>
      </div>
    </form>
  );
}
