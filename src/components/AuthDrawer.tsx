"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { GoogleButton } from "@/components/GoogleButton";

type Tab = "login" | "registro";

export function AuthDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("login");

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Iniciar sesión o crear cuenta"
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-neutral-900 z-50 shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-5 border-b-2 border-ajicolor-ink">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("login")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                tab === "login" ? "bg-ajicolor-ink text-white" : "text-gray-400 dark:text-neutral-500"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setTab("registro")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                tab === "registro" ? "bg-ajicolor-ink text-white" : "text-gray-400 dark:text-neutral-500"
              }`}
            >
              Crear cuenta
            </button>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === "login" ? <LoginForm onClose={onClose} /> : <RegistroForm onClose={onClose} />}
        </div>
      </div>
    </>
  );
}

function LoginForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("cliente-login", { email, password, redirect: false });

    setLoading(false);

    if (res?.error) {
      setError("Credenciales inválidas");
      return;
    }

    onClose();
    router.push("/cuenta");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="drawer-login-email" className="block text-xs font-bold uppercase tracking-wide mb-2">
            Email
          </label>
          <input
            id="drawer-login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
          />
        </div>

        <div>
          <label htmlFor="drawer-login-password" className="block text-xs font-bold uppercase tracking-wide mb-2">
            Contraseña
          </label>
          <input
            id="drawer-login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
          />
          <a
            href="/recuperar"
            className="block text-right text-xs font-bold text-ajicolor-magenta hover:underline mt-2"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-block w-full bg-ajicolor-yellow justify-center py-3 disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Login"}
        </button>
      </form>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
        <span className="text-xs font-bold uppercase text-gray-400 dark:text-neutral-500">o</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
      </div>

      <GoogleButton callbackUrl="/cuenta" />

      <div className="flex justify-center pt-2">
        <Image src="/iconos/aji-login.png" alt="" width={200} height={200} className="w-48 h-48 object-contain" />
      </div>
    </div>
  );
}

function RegistroForm({ onClose }: { onClose: () => void }) {
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
        onClose();
        router.push("/login-cliente");
        return;
      }
      onClose();
      router.push("/cuenta");
      router.refresh();
    } catch {
      setError("Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="drawer-registro-nombre" className="block text-xs font-bold uppercase tracking-wide mb-2">
            Nombre
          </label>
          <input
            id="drawer-registro-nombre"
            type="text"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
          />
        </div>

        <div>
          <label htmlFor="drawer-registro-email" className="block text-xs font-bold uppercase tracking-wide mb-2">
            Email
          </label>
          <input
            id="drawer-registro-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
          />
        </div>

        <div>
          <label htmlFor="drawer-registro-password" className="block text-xs font-bold uppercase tracking-wide mb-2">
            Contraseña
          </label>
          <input
            id="drawer-registro-password"
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
          <label htmlFor="drawer-registro-telefono" className="block text-xs font-bold uppercase tracking-wide mb-2">
            Teléfono
          </label>
          <input
            id="drawer-registro-telefono"
            type="tel"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
          />
        </div>

        <div>
          <label htmlFor="drawer-registro-direccion" className="block text-xs font-bold uppercase tracking-wide mb-2">
            Dirección
          </label>
          <input
            id="drawer-registro-direccion"
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

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
        <span className="text-xs font-bold uppercase text-gray-400 dark:text-neutral-500">o</span>
        <div className="flex-1 h-px bg-gray-200 dark:bg-neutral-700" />
      </div>

      <GoogleButton callbackUrl="/cuenta" />

      <div className="flex justify-center pt-2">
        <Image src="/iconos/aji-registro.png" alt="" width={200} height={200} className="w-48 h-48 object-contain" />
      </div>
    </div>
  );
}
