"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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

    const res = await signIn("credentials", {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center text-ajicolor-magenta mb-6">
          Ajicolor Admin
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta/50 focus:border-ajicolor-magenta"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              disabled={needsTotp}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta/50 focus:border-ajicolor-magenta disabled:bg-gray-100"
            />
          </div>

          {needsTotp && (
            <div>
              <label htmlFor="totpToken" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta/50 focus:border-ajicolor-magenta"
              />
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ajicolor-magenta text-white py-2 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Verificando..." : needsTotp ? "Verificar código" : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
