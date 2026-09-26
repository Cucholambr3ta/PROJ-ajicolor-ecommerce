"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";

function RestablecerForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [passwordNueva, setPasswordNueva] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { resetPassword } = await import("@/lib/actions/auth-recovery");
    const result = await resetPassword({ token, passwordNueva });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(true);
    setTimeout(() => router.push("/login-cliente"), 2000);
  }

  if (!token) {
    return <p className="text-sm text-center text-ajicolor-magenta font-semibold">Falta el enlace de recuperación.</p>;
  }

  if (saved) {
    return (
      <p className="text-sm text-center text-ajicolor-green font-semibold">
        Contraseña actualizada. Redirigiendo al inicio de sesión...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="passwordNueva" className="block text-xs font-bold uppercase tracking-wide mb-2">
          Nueva contraseña
        </label>
        <input
          id="passwordNueva"
          type="password"
          required
          minLength={8}
          value={passwordNueva}
          onChange={(e) => setPasswordNueva(e.target.value)}
          className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
        />
        <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1">Mínimo 8 caracteres.</p>
      </div>

      {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="btn-block w-full bg-ajicolor-yellow justify-center py-3 disabled:opacity-50"
      >
        {loading ? "Guardando..." : "Restablecer contraseña"}
      </button>
    </form>
  );
}

export default function RestablecerPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ajicolor-light p-6">
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 thick-border pop-shadow p-10">
        <Link href="/" className="flex justify-center mb-1">
          <Logo />
        </Link>
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-8">
          Restablecer contraseña
        </p>

        <Suspense fallback={null}>
          <RestablecerForm />
        </Suspense>
      </div>
    </div>
  );
}
