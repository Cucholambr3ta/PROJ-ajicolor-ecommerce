import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Devoluciones y Garantía",
  description: "Política de cambios, devoluciones y garantía legal de Ajicolor.",
};

export default function DevolucionesPage() {
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

      <main className="max-w-3xl mx-auto py-16 p-8 flex-1 space-y-8 text-gray-700 dark:text-neutral-300">
        <h1 className="text-4xl font-black border-b-2 border-ajicolor-ink pb-4">Cambios y devoluciones</h1>

        <section className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-8 space-y-4">
          <h2 className="text-xl font-black text-ajicolor-purple">Derecho a retracto</h2>
          <p className="text-sm leading-relaxed">
            De acuerdo al Artículo 3 bis de la Ley N° 19.496 sobre Protección de los Derechos de los
            Consumidores, en toda compra realizada a distancia (como esta tienda online) el cliente tiene
            derecho a retractarse dentro de un plazo de <strong>10 días corridos</strong> contados desde la
            recepción del producto, sin necesidad de expresar causa.
          </p>
          <p className="text-sm leading-relaxed">
            Para ejercer este derecho, el producto debe estar sin uso, con sus etiquetas originales y en el
            mismo estado en que fue entregado. El costo de devolución del producto corre por cuenta del
            cliente, salvo que la devolución se deba a un error de la tienda o un producto defectuoso.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-8 space-y-4">
          <h2 className="text-xl font-black text-ajicolor-purple">Cambios de talla</h2>
          <p className="text-sm leading-relaxed">
            Si el talle no corresponde, podés solicitar un cambio dentro de los 10 días corridos posteriores
            a la recepción, sujeto a disponibilidad de stock. El producto debe estar sin uso y con etiquetas.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-8 space-y-4">
          <h2 className="text-xl font-black text-ajicolor-purple">Garantía legal</h2>
          <p className="text-sm leading-relaxed">
            Todo producto cuenta con la garantía legal establecida en el Artículo 20 de la Ley N° 19.496.
            Si el producto presenta fallas de fabricación, podés solicitar reparación, cambio o devolución
            del dinero dentro de los <strong>3 meses</strong> siguientes a la compra.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-8 space-y-4">
          <h2 className="text-xl font-black text-ajicolor-purple">Tiempos de producción</h2>
          <p className="text-sm leading-relaxed">
            Todas nuestras poleras son 100% serigrafía, hechas por encargo. Una vez confirmado el pago, el
            plazo de producción es de <strong>5 a 7 días hábiles</strong> antes del despacho.
          </p>
        </section>

        <section className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-8 space-y-4">
          <h2 className="text-xl font-black text-ajicolor-purple">Cómo solicitar un cambio o devolución</h2>
          <p className="text-sm leading-relaxed">
            Escribinos a través de la sección{" "}
            <Link href="/contacto" className="text-ajicolor-magenta underline">
              Contacto
            </Link>{" "}
            indicando tu número de pedido y motivo. Te responderemos con los pasos a seguir.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
