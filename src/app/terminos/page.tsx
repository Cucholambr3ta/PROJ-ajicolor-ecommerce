import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de compra en Ajicolor, según la Ley 19.496.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-ajicolor-light dark:bg-[var(--bg-light)] flex flex-col">
      <SiteHeader />

      <main className="max-w-3xl mx-auto py-16 p-8 flex-1 space-y-8 text-gray-700 dark:text-neutral-300">
        <h1 className="text-4xl font-black border-b-2 border-ajicolor-ink pb-4">Términos y condiciones</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple dark:text-neutral-100">1. Identificación del proveedor</h2>
          <p className="text-sm leading-relaxed">
            <strong>[COMPLETAR]</strong>, RUT <strong>[COMPLETAR]</strong>, con domicilio en{" "}
            <strong>[COMPLETAR]</strong>, opera este sitio bajo el nombre comercial Ajicolor.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple dark:text-neutral-100">2. Aceptación de los términos</h2>
          <p className="text-sm leading-relaxed">
            Al utilizar este sitio y realizar una compra, el usuario acepta estos términos y condiciones,
            así como la Política de Privacidad y la Política de Cambios y Devoluciones.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple dark:text-neutral-100">3. Productos y precios</h2>
          <p className="text-sm leading-relaxed">
            Los precios publicados están expresados en pesos chilenos (CLP) e incluyen IVA cuando corresponda.
            Ajicolor se reserva el derecho de modificar precios y disponibilidad de stock sin previo aviso,
            respetando los precios ya confirmados en pedidos realizados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple dark:text-neutral-100">4. Proceso de compra</h2>
          <p className="text-sm leading-relaxed">
            El usuario debe registrarse con datos verídicos. Al confirmar un pedido, se genera una orden de
            compra sujeta a disponibilidad de stock. El contrato de compraventa se perfecciona al confirmar
            el pedido en el sitio.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple dark:text-neutral-100">5. Derecho a retracto y garantía legal</h2>
          <p className="text-sm leading-relaxed">
            Consulta el detalle completo en nuestra página de{" "}
            <Link href="/devoluciones" className="text-ajicolor-magenta underline">
              Cambios y devoluciones
            </Link>
            , conforme a la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple dark:text-neutral-100">6. Envíos</h2>
          <p className="text-sm leading-relaxed">
            Los plazos y costos de envío se informan al momento de la compra. Ajicolor no se responsabiliza
            por retrasos atribuibles a la empresa de transporte una vez despachado el pedido.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple dark:text-neutral-100">7. Propiedad intelectual</h2>
          <p className="text-sm leading-relaxed">
            Todo el contenido de este sitio (logo, diseños, imágenes) es propiedad de Ajicolor o de sus
            respectivos licenciantes y no puede reproducirse sin autorización.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple dark:text-neutral-100">8. Ley aplicable</h2>
          <p className="text-sm leading-relaxed">
            Estos términos se rigen por las leyes de la República de Chile, en particular la Ley N° 19.496
            sobre Protección de los Derechos de los Consumidores.
          </p>
        </section>

        <p className="text-xs text-gray-400 dark:text-neutral-500">Última actualización: {new Date().toLocaleDateString("es-CL")}</p>
      </main>

      <Footer />
    </div>
  );
}
