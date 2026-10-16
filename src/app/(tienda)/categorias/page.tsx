import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Categorías",
  description: "Los tipos de producto que vende Ajicolor: poleras de bandas y lo que viene.",
};

import { prisma } from "@/lib/prisma";

const CATEGORIAS_TODAS = [
  { slug: "poleras", nombre: "Poleras", color: "bg-ajicolor-green", descripcion: "Diseños exclusivos de bandas y artistas, 100% serigrafía, hechas por encargo." },
  { slug: "polerones", nombre: "Polerones", color: "bg-ajicolor-purple" },
  { slug: "totebag", nombre: "Totebag", color: "bg-ajicolor-magenta" },
  { slug: "relojes", nombre: "Relojes", color: "bg-ajicolor-yellow" },
  { slug: "papeleria", nombre: "Papelería", color: "bg-ajicolor-green", descripcion: "Afiches, pósters y más" },
];

const TIPO_POR_SLUG: Record<string, "Polera" | "Poleron" | "Totebag" | "Reloj" | "Papeleria"> = {
  poleras: "Polera",
  polerones: "Poleron",
  totebag: "Totebag",
  relojes: "Reloj",
  papeleria: "Papeleria",
};

export default async function CategoriasPage() {
  const conteos = await prisma.product.groupBy({
    by: ["tipo"],
    where: { activo: true },
    _count: true,
  });
  const conteoPorTipo = Object.fromEntries(conteos.map((c) => [c.tipo, c._count]));

  return (
    <main className="max-w-5xl mx-auto py-16 p-8">
      <h1 className="text-4xl font-black mb-2 border-b-2 border-ajicolor-ink pb-4">Categorías</h1>
      <p className="text-sm text-gray-500 dark:text-neutral-400 mb-10">
        Los tipos de producto que vendemos — elegí uno para ver el catálogo filtrado.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIAS_TODAS.map((cat) => {
          const disponible = (conteoPorTipo[TIPO_POR_SLUG[cat.slug]] ?? 0) > 0;
          return disponible ? (
            <Link
              key={cat.slug}
              href={`/?tipo=${cat.slug}`}
              className={`block ${cat.color} thick-border pop-shadow p-8 hover:opacity-90 transition-opacity`}
            >
              <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-2">Disponible ahora</p>
              <p className="text-white text-3xl font-black uppercase tracking-wide mb-2">{cat.nombre}</p>
              {cat.descripcion && <p className="text-white/80 text-sm">{cat.descripcion}</p>}
            </Link>
          ) : (
            <div
              key={cat.slug}
              className={`${cat.color} thick-border p-6 flex flex-col items-center justify-center text-center gap-1 opacity-50 cursor-not-allowed`}
            >
              <p className="text-white font-black uppercase tracking-wide">{cat.nombre}</p>
              {cat.descripcion && <p className="text-white/80 text-xs">{cat.descripcion}</p>}
              <span className="text-white/60 text-[9px] uppercase tracking-widest mt-1">Próximamente</span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
