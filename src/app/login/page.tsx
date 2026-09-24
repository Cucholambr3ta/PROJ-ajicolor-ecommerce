"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpToken, setTotpToken] = useState("");
  const [needsTotp, setNeedsTotp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!needsTotp) {
      const check = await fetch("/api/auth/check-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).then((r) => r.json());

      if (check.totpEnabled) {
        setNeedsTotp(true);
        setLoading(false);
        return;
      }
    }

    const res = await signIn("admin-login", {
      email,
      password,
      totpToken,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError(needsTotp ? "Código 2FA inválido" : "Credenciales inválidas");
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ajicolor-light p-6">
      <div className="w-full max-w-sm bg-white thick-border pop-shadow p-10">
        <div className="flex justify-center mb-1">
          <Logo />
        </div>
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-8">Admin</p>

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
              disabled={needsTotp}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta disabled:bg-gray-100"
            />
          </div>

          {needsTotp && (
            <div>
              <label htmlFor="totpToken" className="block text-xs font-bold uppercase tracking-wide mb-2">
                Código de autenticación (2FA)
              </label>
              <input
                id="totpToken"
                type="text"
                inputMode="numeric"
                autoFocus
                required
                maxLength={6}
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value)}
                className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
              />
            </div>
          )}

          {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-block w-full bg-ajicolor-yellow justify-center py-3 disabled:opacity-50"
          >
            {loading ? (needsTotp ? "Verificando..." : "Ingresando...") : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
