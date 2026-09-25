import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Datos de contacto e información legal de Ajicolor.",
};

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-ajicolor-light flex flex-col">
      <nav className="site-nav">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="font-bold text-xs uppercase hover:underline">
            ← Volver a la tienda
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-16 p-8 flex-1">
        <h1 className="text-4xl font-black mb-8 border-b-2 border-ajicolor-ink pb-4">Contacto</h1>

        <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-8 space-y-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">Razón social</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">[COMPLETAR]</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">RUT</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">[COMPLETAR]</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">Dirección</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">[COMPLETAR]</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">Email</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">ajicolorserigrafia28@gmail.com</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">Teléfono / WhatsApp</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">+56 9 7828 3064</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">Redes sociales</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta space-x-3">
              <span>Instagram: @el_aji_color_estampados</span>
            </p>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
              Facebook: El Ají Color Diseño y Estampados · TikTok: @el.aji.color.esta
            </p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1">Horario de atención</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">
              Lunes a viernes: 09:00 – 19:00 hrs<br />
              Sábado: 09:00 – 14:00 hrs
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
