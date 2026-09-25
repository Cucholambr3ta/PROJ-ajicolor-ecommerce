"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";

interface SettingsData {
  razonSocial: string;
  rut: string;
  direccionLegal: string;
  emailContacto: string;
  telefonoContacto: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  horarioAtencion: string;
  bancoTitular: string;
  bancoRut: string;
  bancoNombre: string;
  bancoTipoCuenta: string;
  bancoNumeroCuenta: string;
  bancoEmail: string;
  costoEnvioCorreos: number;
  plazoProduccionDias: number;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 dark:border-neutral-700 rounded-md px-3 py-2 text-sm dark:bg-neutral-800 dark:text-neutral-100"
      />
    </div>
  );
}

export default function ConfiguracionFormClient({ settings }: { settings: SettingsData }) {
  const router = useRouter();
  const [data, setData] = useState(settings);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof SettingsData>(key: K, value: string) {
    setData((prev) => ({
      ...prev,
      [key]: typeof prev[key] === "number" ? Number(value) || 0 : value,
    }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { updateStoreSettings } = await import("@/lib/actions/settings");
      await updateStoreSettings(data);
      setSaved(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-black mb-6 dark:text-neutral-100">Configuración de la tienda</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-4">
            Datos legales del proveedor
            <span className="block text-xs font-normal text-gray-400 dark:text-neutral-500 mt-1">
              Obligatorios por la Ley 19.496 para publicar /contacto y /terminos sin placeholders.
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Razón social" value={data.razonSocial} onChange={(v) => set("razonSocial", v)} />
            <Field label="RUT" value={data.rut} onChange={(v) => set("rut", v)} />
            <div className="md:col-span-2">
              <Field label="Dirección legal" value={data.direccionLegal} onChange={(v) => set("direccionLegal", v)} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-4">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Email de contacto" value={data.emailContacto} onChange={(v) => set("emailContacto", v)} />
            <Field label="Teléfono" value={data.telefonoContacto} onChange={(v) => set("telefonoContacto", v)} />
            <Field label="WhatsApp" value={data.whatsapp} onChange={(v) => set("whatsapp", v)} />
            <Field label="Horario de atención" value={data.horarioAtencion} onChange={(v) => set("horarioAtencion", v)} />
            <Field label="Instagram" value={data.instagram} onChange={(v) => set("instagram", v)} />
            <Field label="Facebook" value={data.facebook} onChange={(v) => set("facebook", v)} />
            <Field label="TikTok" value={data.tiktok} onChange={(v) => set("tiktok", v)} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-4">
            Datos bancarios
            <span className="block text-xs font-normal text-gray-400 dark:text-neutral-500 mt-1">
              Se muestran al cliente en la confirmación de cada pedido pendiente de pago.
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nombre del titular" value={data.bancoTitular} onChange={(v) => set("bancoTitular", v)} />
            <Field label="RUT del titular" value={data.bancoRut} onChange={(v) => set("bancoRut", v)} />
            <Field label="Banco" value={data.bancoNombre} onChange={(v) => set("bancoNombre", v)} />
            <Field label="Tipo de cuenta" value={data.bancoTipoCuenta} onChange={(v) => set("bancoTipoCuenta", v)} />
            <Field label="Número de cuenta" value={data.bancoNumeroCuenta} onChange={(v) => set("bancoNumeroCuenta", v)} />
            <Field label="Email asociado" value={data.bancoEmail} onChange={(v) => set("bancoEmail", v)} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 dark:text-neutral-300 mb-4">Envío y producción</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Costo envío Correos de Chile (CLP)"
              type="number"
              value={data.costoEnvioCorreos}
              onChange={(v) => set("costoEnvioCorreos", v)}
            />
            <Field
              label="Plazo de producción (días hábiles)"
              type="number"
              value={data.plazoProduccionDias}
              onChange={(v) => set("plazoProduccionDias", v)}
            />
          </div>
        </Card>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {saved && <p className="text-ajicolor-green text-sm font-medium">Guardado correctamente.</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-block bg-ajicolor-magenta text-white disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar configuración"}
        </button>
      </form>
    </div>
  );
}
