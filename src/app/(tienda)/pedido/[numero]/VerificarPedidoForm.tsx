"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function VerificarPedidoForm({
  numero,
  errorEmail,
}: {
  numero: number;
  errorEmail: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/pedido/${numero}?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6 space-y-4">
      <div>
        <label htmlFor="verificar-email" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">
          Email de la compra
        </label>
        <input
          id="verificar-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm dark:bg-neutral-800"
          placeholder="tu@email.com"
        />
      </div>
      {errorEmail && (
        <p className="text-sm font-semibold text-ajicolor-magenta">
          Ese email no coincide con el de esta compra.
        </p>
      )}
      <button type="submit" className="btn-block bg-ajicolor-green text-white justify-center py-3 w-full">
        Ver mi pedido
      </button>
    </form>
  );
}
