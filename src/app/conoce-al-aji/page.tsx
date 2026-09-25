import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Conoce al Ají",
  description: "La historia de Ajicolor: poleras exclusivas de bandas, hechas en Chile.",
};

export default function ConoceAlAjiPage() {
  return (
    <div className="min-h-screen bg-ajicolor-light flex flex-col">
      <SiteHeader active="/conoce-al-aji" />

      <main className="max-w-3xl mx-auto py-16 p-8 flex-1 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/icono.png" alt="Ají Ajicolor" className="w-32 h-32 mx-auto mb-8" />
        <h1 className="text-4xl font-black mb-6">Le ponemos color</h1>
        <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-8 text-left space-y-4 text-gray-700 dark:text-neutral-300">
          <p className="text-sm leading-relaxed">
            Ají Color nace conceptualmente en 2020 de una necesidad simple: romper con la monotonía del
            merchandising. El fundador, músico y fanático de bandas chilenas y extranjeras, buscaba lienzos
            textiles de colores variados para vestir, que representaran las notas y las diversas gráficas
            que las bandas y su música ofrecían.
          </p>
          <p className="text-sm leading-relaxed">
            Al no encontrar variedad de colores y diseños, se las ingenió para tener su propio taller de
            estampados en serigrafía y así plasmar diseños exclusivos en prendas de varios colores.
            Teniendo este concepto como su bandera, lanzó su página por redes sociales, donde comercializó
            su trabajo y motivó a que más fanáticos se atrevieran a ir más allá del clásico color negro
            que dominaba el merchandising del mercado.
          </p>
          <p className="text-sm leading-relaxed">
            La palabra <strong>Ají</strong> se escogió por su potente vínculo con la geografía de Chile,
            en su forma alargada. La palabra <strong>Color</strong> fue la respuesta directa a la
            necesidad de diferenciación.
          </p>
          <p className="text-sm leading-relaxed">
            Así, Ají Color se transforma en el condimento que se encarga de darle vida al vestuario,
            enfocándose en la exclusividad y en hacer de cada prenda un objeto único.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
