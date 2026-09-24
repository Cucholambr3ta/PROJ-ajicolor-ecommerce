import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Conoce al Ají",
  description: "La historia de Ajicolor: poleras exclusivas de bandas, hechas en Chile.",
};

export default function ConoceAlAjiPage() {
  return (
    <div className="min-h-screen bg-ajicolor-light flex flex-col">
      <nav className="site-nav">
        <Link href="/">
          <Logo />
        </Link>
        <div className="hidden lg:flex gap-10 font-bold text-sm text-ajicolor-purple">
          <Link href="/conoce-al-aji" className="underline decoration-2 underline-offset-4">
            Conoce al Ají
          </Link>
          <Link href="/">Catálogo</Link>
          <Link href="/contacto">Contacto</Link>
        </div>
        <Link href="/" className="font-bold text-xs uppercase hover:underline">
          ← Volver a la tienda
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto py-16 p-8 flex-1 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo/icono.png" alt="Ají Ajicolor" className="w-32 h-32 mx-auto mb-8" />
        <h1 className="text-4xl font-black mb-6">Le ponemos color</h1>
        <div className="bg-white thick-border pop-shadow p-8 text-left space-y-4 text-gray-700">
          <p className="text-sm leading-relaxed">
            Ajicolor nació con una idea simple: vestir el ritmo. Cada polera es producto exclusivo, hecho a
            mano, 100% algodón, pensado para melómanos que quieren llevar su música favorita puesta.
          </p>
          <p className="text-sm leading-relaxed">
            Trabajamos con impresión de calidad sobre poleras premium, en colecciones limitadas dedicadas a
            bandas y artistas que marcaron generaciones. Sin producción masiva, sin diseños genéricos —
            merch pensado por y para fans reales.
          </p>
          <p className="text-sm leading-relaxed">
            Hecho en Chile, con color, con actitud, con ají.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
