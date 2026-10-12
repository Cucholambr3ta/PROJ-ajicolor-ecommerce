"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BuscarPedidoForm() {
  const router = useRouter();
  const [numero, setNumero] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numeroLimpio = numero.trim().replace(/^#/, "").replace(/^0+/, "");
    if (!numeroLimpio || Number.isNaN(parseInt(numeroLimpio, 10))) {
      setError("Ingresa un número de pedido válido");
      return;
    }
    router.push(`/pedido/${numeroLimpio}?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6 space-y-4">
      <div>
        <label htmlFor="buscar-numero" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">
          Número de pedido
        </label>
        <input
          id="buscar-numero"
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
          className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm dark:bg-neutral-800"
          placeholder="0001"
          required
        />
      </div>
      <div>
        <label htmlFor="buscar-email" className="block text-xs font-bold uppercase text-gray-500 dark:text-neutral-400 mb-1">
          Email de la compra
        </label>
        <input
          id="buscar-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-ajicolor-ink rounded-md px-3 py-2 text-sm dark:bg-neutral-800"
          placeholder="tu@email.com"
          required
        />
      </div>
      {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}
      <button type="submit" className="btn-block bg-ajicolor-green text-white justify-center py-3 w-full">
        Buscar pedido
      </button>
    </form>
  );
}
