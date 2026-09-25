import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { getStoreSettings } from "@/lib/actions/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Datos de contacto e información legal de Ajicolor.",
};

export default async function ContactoPage() {
  const settings = await getStoreSettings();

  return (
    <div className="min-h-screen bg-ajicolor-light dark:bg-[var(--bg-light)] flex flex-col">
      <SiteHeader active="/contacto" />

      <main className="max-w-3xl mx-auto py-16 p-8 flex-1">
        <h1 className="text-4xl font-black mb-8 border-b-2 border-ajicolor-ink pb-4">Contacto</h1>

        <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-8 space-y-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">Razón social</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">{settings.razonSocial ?? "[COMPLETAR]"}</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">RUT</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">{settings.rut ?? "[COMPLETAR]"}</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">Dirección</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">{settings.direccionLegal ?? "[COMPLETAR]"}</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">Email</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">{settings.emailContacto ?? "[COMPLETAR]"}</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">Teléfono / WhatsApp</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">{settings.telefonoContacto ?? "[COMPLETAR]"}</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">Redes sociales</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">
              {settings.instagram && <span>Instagram: @{settings.instagram}</span>}
            </p>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
              {[
                settings.facebook && `Facebook: ${settings.facebook}`,
                settings.tiktok && `TikTok: @${settings.tiktok}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">Horario de atención</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta whitespace-pre-line">
              {settings.horarioAtencion ?? "[COMPLETAR]"}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 dark:text-neutral-500 mt-6">
          Esta información es obligatoria bajo la Ley N° 19.496 sobre Protección de los Derechos de los
          Consumidores (Chile), Art. 28 y 32, para todo proveedor que realice ventas a distancia.
        </p>
      </main>

      <Footer />
    </div>
  );
}
