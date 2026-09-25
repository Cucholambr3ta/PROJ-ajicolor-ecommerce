import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Cómo Ajicolor trata tus datos personales, según la Ley 19.628.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-ajicolor-light flex flex-col">
      <SiteHeader />

      <main className="max-w-3xl mx-auto py-16 p-8 flex-1 space-y-8 text-gray-700 dark:text-neutral-300">
        <h1 className="text-4xl font-black border-b-2 border-ajicolor-ink pb-4">Política de privacidad</h1>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple">1. Datos que recopilamos</h2>
          <p className="text-sm leading-relaxed">
            Al crear una cuenta o realizar una compra recopilamos: nombre, email, teléfono, dirección y
            contraseña (almacenada de forma cifrada, nunca en texto plano). También registramos el historial
            de pedidos asociado a tu cuenta.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple">2. Finalidad del tratamiento</h2>
          <p className="text-sm leading-relaxed">
            Usamos tus datos exclusivamente para: procesar y despachar tus pedidos, gestionar tu cuenta,
            responder consultas de soporte, y cumplir obligaciones legales y tributarias.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple">3. Base legal</h2>
          <p className="text-sm leading-relaxed">
            El tratamiento de tus datos se ajusta a la Ley N° 19.628 sobre Protección de la Vida Privada y
            sus modificaciones. Tus datos no se venden ni comparten con terceros con fines comerciales.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple">4. Derechos del titular</h2>
          <p className="text-sm leading-relaxed">
            Puedes solicitar en cualquier momento el acceso, rectificación, cancelación u oposición
            (derechos ARCO) sobre tus datos personales, escribiendo a través de la sección{" "}
            <Link href="/contacto" className="text-ajicolor-magenta underline">
              Contacto
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple">5. Seguridad</h2>
          <p className="text-sm leading-relaxed">
            Tu contraseña se almacena cifrada mediante hash bcrypt. Las conexiones a este sitio se realizan
            mediante HTTPS. No almacenamos datos de tarjetas de crédito/débito directamente.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-ajicolor-purple">6. Conservación de datos</h2>
          <p className="text-sm leading-relaxed">
            Conservamos tus datos mientras mantengas una cuenta activa en el sitio, o según lo exijan las
            obligaciones legales y tributarias vigentes en Chile.
          </p>
        </section>

        <p className="text-xs text-gray-400 dark:text-neutral-500">Última actualización: {new Date().toLocaleDateString("es-CL")}</p>
      </main>

      <Footer />
    </div>
  );
}
