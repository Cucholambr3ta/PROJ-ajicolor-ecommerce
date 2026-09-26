import type { Metadata } from "next";
import Link from "next/link";
import { getPublicCollections } from "@/lib/actions/collections";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { formatFecha } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Drops",
  description: "Lanzamientos limitados de Ajicolor: colecciones exclusivas de poleras de bandas.",
};

export default async function DropsPage() {
  const collections = await getPublicCollections();
  const activos = collections.filter((c) => c.activa);
  const cerrados = collections.filter((c) => !c.activa);

  return (
    <div className="min-h-screen bg-ajicolor-light dark:bg-[var(--bg-light)] flex flex-col">
      <SiteHeader active="/drops" />

      <main className="max-w-5xl mx-auto py-16 p-8 flex-1">
        <h1 className="text-4xl font-black mb-2 border-b-2 border-ajicolor-ink pb-4">Drops</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mb-10">
          Lanzamientos limitados. Cuando se acaban, se acaban — no reimprimimos drops cerrados.
        </p>

        {collections.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-neutral-500 font-medium py-20">
            Todavía no hay drops publicados. Vuelve pronto.
          </p>
        ) : (
          <>
            {activos.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xs font-bold uppercase tracking-widest text-ajicolor-green mb-4">Activos</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {activos.map((c) => (
                    <Link
                      key={c.id}
                      href={`/?coleccion=${c.slug}`}
                      className="block bg-ajicolor-green thick-border pop-shadow p-6 hover:opacity-90 transition-opacity"
                    >
                      <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">
                        Drop activo · {c._count.products} producto{c._count.products !== 1 ? "s" : ""}
                      </p>
                      <p className="text-white text-2xl font-black uppercase tracking-wide mb-2">{c.nombre}</p>
                      {c.descripcion && <p className="text-white/80 text-sm">{c.descripcion}</p>}
                      {c.fechaLanzamiento && (
                        <p className="text-white/60 text-xs mt-3">Lanzado el {formatFecha(c.fechaLanzamiento)}</p>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {cerrados.length > 0 && (
              <section>
                <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-4">
                  Drops anteriores
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {cerrados.map((c) => (
                    <Link
                      key={c.id}
                      href={`/?coleccion=${c.slug}`}
                      className="block bg-white dark:bg-neutral-900 thick-border p-6 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <p className="text-gray-400 dark:text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">
                        Cerrado · {c._count.products} producto{c._count.products !== 1 ? "s" : ""} disponible
                        {c._count.products !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xl font-black uppercase tracking-wide mb-2">{c.nombre}</p>
                      {c.descripcion && <p className="text-gray-500 dark:text-neutral-400 text-sm">{c.descripcion}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
