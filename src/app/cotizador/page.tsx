import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Cotizador",
  description: "Cotiza tu merch personalizado con Ajicolor.",
};

export default function CotizadorPage() {
  return (
    <div className="min-h-screen bg-ajicolor-light dark:bg-[var(--bg-light)] flex flex-col">
      <SiteHeader active="/cotizador" />

      <main className="max-w-2xl mx-auto py-20 p-8 flex-1 text-center">
        <div className="bg-ajicolor-purple thick-border pop-shadow p-10">
          <p className="text-ajicolor-yellow text-[10px] font-bold uppercase tracking-widest mb-3">Le ponemos color</p>
          <h1 className="text-3xl font-black text-white mb-4">Cotizador de merch</h1>
          <p className="text-white/80 text-sm mb-8">
            Estamos armando una herramienta para que cotices tu proyecto personalizado — diseño, cantidad y
            colores — directo desde aquí. Mientras tanto, escríbenos y te ayudamos a mano.
          </p>
          <Link href="/contacto" className="btn-block bg-ajicolor-yellow inline-flex">
            Contáctanos
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
