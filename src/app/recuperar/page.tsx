"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { requestPasswordReset } = await import("@/lib/actions/auth-recovery");
    await requestPasswordReset(email);
    setLoading(false);
    // Siempre mostramos el mismo mensaje, exista o no la cuenta — evita
    // revelar qué emails están registrados.
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ajicolor-light p-6">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 thick-border pop-shadow p-10">
        <Link href="/" className="flex justify-center mb-1">
          <Logo />
        </Link>
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-8">
          Recuperar contraseña
        </p>

        {sent ? (
          <p className="text-sm text-center text-gray-600 dark:text-neutral-300">
            Si existe una cuenta con ese email, te enviamos instrucciones para restablecer tu contraseña.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wide mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-block w-full bg-ajicolor-yellow justify-center py-3 disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar instrucciones"}
            </button>
          </form>
        )}

        <Link href="/login-cliente" className="block text-center text-xs font-bold uppercase mt-6 hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    </div>
  );
}
