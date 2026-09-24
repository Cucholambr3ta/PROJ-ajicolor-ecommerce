"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SeguridadPageClient({ totpEnabled }: { totpEnabled: boolean }) {
  const router = useRouter();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleStartSetup() {
    setError("");
    setLoading(true);
    try {
      const { startTotpSetup } = await import("@/lib/actions/auth-2fa");
      const result = await startTotpSetup();
      setQrCodeDataUrl(result.qrCodeDataUrl);
      setSecret(result.secret);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar 2FA");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { confirmTotpSetup } = await import("@/lib/actions/auth-2fa");
      await confirmTotpSetup(token);
      setQrCodeDataUrl(null);
      setSecret(null);
      setToken("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al confirmar 2FA");
    } finally {
      setLoading(false);
    }
  }

  async function handleDisable() {
    setError("");
    setLoading(true);
    try {
      const { disableTotp } = await import("@/lib/actions/auth-2fa");
      await disableTotp();
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al desactivar 2FA");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Seguridad</h1>

      <Card className="p-6 max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-200">Autenticación de dos factores (2FA)</h2>
          {totpEnabled ? <Badge>Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}
        </div>

        {totpEnabled ? (
          <div>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
              2FA está activo. Cada inicio de sesión requerirá un código de tu app de autenticación.
            </p>
            <button
              onClick={handleDisable}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50"
            >
              Desactivar 2FA
            </button>
          </div>
        ) : qrCodeDataUrl ? (
          <form onSubmit={handleConfirm}>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-3">
              Escaneá el código con Google Authenticator, Authy o similar, luego ingresá el código de 6 dígitos.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeDataUrl} alt="Código QR 2FA" className="mx-auto mb-3" />
            {secret && (
              <p className="text-xs text-gray-400 dark:text-neutral-500 text-center mb-4 font-mono break-all">
                Clave manual: {secret}
              </p>
            )}
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm text-center tracking-widest mb-3"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Confirmar y activar"}
            </button>
          </form>
        ) : (
          <div>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-4">
              Agregá una capa extra de seguridad a tu cuenta con un código de 6 dígitos generado por app.
            </p>
            <button
              onClick={handleStartSetup}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Generando..." : "Activar 2FA"}
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </Card>
    </div>
  );
}
