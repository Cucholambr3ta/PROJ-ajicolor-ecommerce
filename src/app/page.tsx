import Link from "next/link";
import Image from "next/image";
import { getProducts, getFilterOptions, getActiveCollections } from "@/lib/actions/products";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { CatalogFilters } from "@/components/CatalogFilters";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  color?: string;
  talle?: string;
  coleccion?: string;
  orden?: "recientes" | "precio-asc" | "precio-desc";
  page?: string;
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) || 1 : 1;

  const [{ items: products, total, totalPages }, { colores, talles }, collections] = await Promise.all([
    getProducts({
      q: sp.q,
      color: sp.color,
      talle: sp.talle,
      collectionSlug: sp.coleccion,
      orden: sp.orden,
      page,
    }),
    getFilterOptions(),
    getActiveCollections(),
  ]);

  const hasFilters = !!(sp.q || sp.color || sp.talle || sp.coleccion);
  const dropActivo = collections.find((c) => !c.fechaCierre || c.fechaCierre > new Date());

  return (
    <div className="min-h-screen bg-ajicolor-light dark:bg-[var(--bg-light)]">
      <SiteHeader active="/" />

      <section className="max-w-7xl mx-auto p-8 pt-10">
        {!hasFilters && page === 1 && (
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            <Link
              href="/categorias"
              className="bg-ajicolor-magenta thick-border p-10 flex flex-col justify-center min-h-[320px] hover:opacity-90 transition-opacity"
            >
              <h1 className="text-5xl font-black text-white leading-tight mb-2">
                PRODUCTO
                <br />
                AJI COLOR
              </h1>
            </Link>
            <div className="grid grid-rows-2 gap-6">
              <div className="grid grid-cols-2 gap-6">
                <Link
                  href="/cotizador"
                  className="bg-ajicolor-purple thick-border p-6 flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <p className="text-white text-xl font-black text-center leading-tight">
                    Le ponemos <span className="text-ajicolor-yellow">color</span>
                  </p>
                </Link>
                <div className="bg-ajicolor-yellow thick-border p-6 flex items-center justify-center">
                  <p className="text-ajicolor-green text-xl font-black text-center leading-tight">
                    Merch para tu proyecto
                  </p>
                </div>
              </div>
              {dropActivo ? (
                <Link
                  href="/drops"
                  className="bg-ajicolor-green thick-border p-6 flex flex-col items-center justify-center text-center hover:opacity-90 transition-opacity"
                >
                  <p className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">Drop activo</p>
                  <p className="text-white text-2xl font-black uppercase tracking-wide">{dropActivo.nombre}</p>
                </Link>
              ) : (
                <Link
                  href="/drops"
                  className="bg-ajicolor-green thick-border p-6 flex items-center justify-center hover:opacity-90 transition-opacity"
                >
                  <p className="text-white text-2xl font-black uppercase tracking-wide text-center">
                    Colecciones exclusivas
                  </p>
                </Link>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between items-end mb-6 border-b-2 border-ajicolor-ink pb-4">
          <h2 className="text-3xl font-black">{hasFilters ? "Resultados" : "Novedades"}</h2>
          <span className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase">
            {total} producto{total !== 1 ? "s" : ""}
          </span>
        </div>

        <CatalogFilters
          colores={colores}
          talles={talles}
          collections={collections.map((c) => ({ slug: c.slug, nombre: c.nombre }))}
        />

        {products.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-neutral-500 font-medium py-20">
            No encontramos productos con esos filtros.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-6">
            {products.map((product) => (
              <Link key={product.id} href={`/producto/${product.slug}`} className="card overflow-hidden flex flex-col">
                <div className="bg-gray-100 dark:bg-neutral-800 relative overflow-hidden aspect-square">
                  <Image
                    src={product.disenoUrl}
                    alt={product.nombre}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-black">{product.nombre}</h3>
                  <p className="text-xs font-medium text-gray-400 dark:text-neutral-500 italic mb-2">{product.temporada}</p>
                  <p className="text-ajicolor-magenta font-black">
                    ${Number(product.precio).toLocaleString("es-CL")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          basePath="/"
          searchParams={{ q: sp.q, color: sp.color, talle: sp.talle, coleccion: sp.coleccion, orden: sp.orden }}
        />
      </section>

      <Footer />
    </div>
  );
}
