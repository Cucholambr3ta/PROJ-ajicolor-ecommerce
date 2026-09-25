"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/Logo";
import { GoogleButton } from "@/components/GoogleButton";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { registerCustomer } = await import("@/lib/actions/customers");
      const result = await registerCustomer({ nombre, email, password, telefono, direccion });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      const res = await signIn("cliente-login", { email, password, redirect: false });
      if (res?.error) {
        router.push("/login-cliente");
        return;
      }
      router.push("/cuenta");
    } catch {
      setError("Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ajicolor-light dark:bg-[var(--bg-light)] p-6">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 thick-border pop-shadow p-10">
        <Link href="/" className="flex justify-center mb-1">
          <Logo />
        </Link>
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-8">Crear cuenta</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-xs font-bold uppercase tracking-wide mb-2">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
            />
          </div>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
            />
            <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">Mínimo 8 caracteres.</p>
          </div>

          <div>
            <label htmlFor="telefono" className="block text-xs font-bold uppercase tracking-wide mb-2">
              Teléfono
            </label>
            <input
              id="telefono"
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
            />
          </div>

          <div>
            <label htmlFor="direccion" className="block text-xs font-bold uppercase tracking-wide mb-2">
              Dirección
            </label>
            <input
              id="direccion"
              type="text"
              required
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
            />
          </div>

          {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-block w-full bg-ajicolor-yellow justify-center py-3 disabled:opacity-50"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
          <span className="text-xs font-bold uppercase text-gray-400 dark:text-neutral-500">o</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
        </div>

        <GoogleButton callbackUrl="/cuenta" />

        <Link href="/login-cliente" className="block text-center text-xs font-bold uppercase mt-6 hover:underline">
          Ya tengo cuenta
        </Link>
      </div>
    </div>
  );
}
