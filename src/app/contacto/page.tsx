import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default function ContactoPage() {
  return (
    <div className="min-h-screen bg-ajicolor-light flex flex-col">
      <nav className="site-nav">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/" className="font-bold text-xs uppercase hover:underline">
          ← Volver a la tienda
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto py-16 p-8 flex-1">
        <h1 className="text-4xl font-black mb-8 border-b-2 border-ajicolor-ink pb-4">Contacto</h1>

        <div className="bg-white thick-border pop-shadow p-8 space-y-6">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Razón social</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">[COMPLETAR]</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">RUT</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">[COMPLETAR]</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Dirección</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">[COMPLETAR]</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Email</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">[COMPLETAR]</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Teléfono / WhatsApp</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">[COMPLETAR]</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Redes sociales</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">[COMPLETAR]</p>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Horario de atención</h2>
            <p className="text-lg font-semibold text-ajicolor-magenta">[COMPLETAR]</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Esta información es obligatoria bajo la Ley N° 19.496 sobre Protección de los Derechos de los
          Consumidores (Chile), Art. 28 y 32, para todo proveedor que realice ventas a distancia.
        </p>
      </main>

      <Footer />
    </div>
  );
}
