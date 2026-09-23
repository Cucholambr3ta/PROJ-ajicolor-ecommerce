"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginClientePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("cliente-login", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Credenciales inválidas");
      return;
    }

    router.push("/perfil");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ajicolor-light p-6">
      <div className="w-full max-w-sm bg-white thick-border pop-shadow p-10">
        <Link href="/" className="block text-center text-2xl font-black mb-1">
          AJI<span className="text-ajicolor-magenta">COLOR</span>
        </Link>
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">My Space</p>

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

          <div>
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wide mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
            />
          </div>

          {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-block w-full bg-ajicolor-yellow justify-center py-3 disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <Link href="/" className="block text-center text-xs font-bold uppercase mt-6 hover:underline">
          ← Volver a la tienda
        </Link>
      </div>
    </div>
  );
}
