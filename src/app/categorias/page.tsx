import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Categorías",
  description: "Los tipos de producto que vende Ajicolor: poleras de bandas y lo que viene.",
};

const CATEGORIAS_PROXIMAS = [
  { nombre: "Hoodies", color: "bg-ajicolor-purple" },
  { nombre: "Accesorios", color: "bg-ajicolor-magenta" },
  { nombre: "Poleras mujer", color: "bg-ajicolor-yellow" },
];

export default function CategoriasPage() {
  return (
    <div className="min-h-screen bg-ajicolor-light dark:bg-[var(--bg-light)] flex flex-col">
      <SiteHeader active="/categorias" />

      <main className="max-w-5xl mx-auto py-16 p-8 flex-1">
        <h1 className="text-4xl font-black mb-2 border-b-2 border-ajicolor-ink pb-4">Categorías</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mb-10">
          Así vamos a ir creciendo el catálogo. Por ahora, todo es polera.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <Link
            href="/"
            className="block bg-ajicolor-green thick-border pop-shadow p-8 hover:opacity-90 transition-opacity"
          >
            <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-2">Disponible ahora</p>
            <p className="text-white text-3xl font-black uppercase tracking-wide mb-2">Poleras</p>
            <p className="text-white/80 text-sm">
              Diseños exclusivos de bandas y artistas, 100% serigrafía, hechas por encargo.
            </p>
          </Link>
        </div>

        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-4">
          Próximamente
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {CATEGORIAS_PROXIMAS.map((cat) => (
            <div
              key={cat.nombre}
              className={`${cat.color} thick-border p-6 flex items-center justify-center text-center opacity-50 cursor-not-allowed`}
            >
              <p className="text-white font-black uppercase tracking-wide">{cat.nombre}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
