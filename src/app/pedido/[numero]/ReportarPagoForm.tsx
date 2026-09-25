"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReportarPagoForm({ orderId, monto }: { orderId: string; monto: number }) {
  const router = useRouter();
  const [banco, setBanco] = useState("");
  const [referencia, setReferencia] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { reportPayment } = await import("@/lib/actions/payments");
      await reportPayment({
        orderId,
        monto,
        banco: banco || undefined,
        referencia: referencia || undefined,
        fechaTransferencia: new Date(),
      });
      setEnviado(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al informar el pago");
    } finally {
      setLoading(false);
    }
  }

  if (enviado) {
    return (
      <div className="bg-ajicolor-yellow/40 thick-border pop-shadow p-6 text-left">
        <p className="text-sm font-medium">
          ¡Gracias! Recibimos tu aviso de pago y lo vamos a revisar a la brevedad.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6 text-left space-y-4">
      <h2 className="font-black uppercase text-sm">Ya transferí, avisar el pago</h2>
      <p className="text-xs text-gray-500 dark:text-neutral-400">
        Contanos desde qué banco transferiste para que podamos confirmarlo más rápido. La subida de
        comprobante estará disponible próximamente — mientras tanto también podés enviarlo por WhatsApp.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="pago-banco" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">
            Banco desde el que transferiste
          </label>
          <input
            id="pago-banco"
            value={banco}
            onChange={(e) => setBanco(e.target.value)}
            className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm dark:bg-neutral-800"
          />
        </div>
        <div>
          <label htmlFor="pago-referencia" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">
            N° de comprobante / referencia
          </label>
          <input
            id="pago-referencia"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm dark:bg-neutral-800"
          />
        </div>
      </div>
      {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-block bg-ajicolor-green text-white justify-center py-3 disabled:opacity-50"
      >
        {loading ? "Enviando..." : "Ya transferí"}
      </button>
    </form>
  );
}
