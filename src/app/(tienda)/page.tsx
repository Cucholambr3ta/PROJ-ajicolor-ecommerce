import Link from "next/link";
import Image from "next/image";
import { getProducts, getFilterOptions, getActiveCollections } from "@/lib/actions/products";
import { CatalogFilters } from "@/components/CatalogFilters";
import { Pagination } from "@/components/Pagination";
import { HeroCards } from "@/components/HeroCards";
import { ProductCarousel } from "@/components/ProductCarousel";

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

  return (
    <>
      <section className="max-w-7xl mx-auto p-8 pt-10">
        {!hasFilters && page === 1 && (
          <HeroCards
            cards={[
              {
                href: "/categorias",
                bg: "bg-ajicolor-magenta p-10",
                content: (
                  <div className="hero-card-text hero-card-text-left relative">
                    <span className="hero-card-text-compact hero-card-text-compact-sm font-black text-white leading-tight">
                      PRODUCTO AJI COLOR
                    </span>
                    <div className="hero-card-text-expanded hero-card-text-expanded-flex items-center gap-6 w-full">
                      <h1 className="text-3xl lg:text-5xl font-black text-white leading-tight shrink-0">
                        PRODUCTO
                        <br />
                        AJI COLOR
                      </h1>
                      <div className="flex-1 min-w-0 h-40 lg:h-56">
                        <ProductCarousel />
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                href: "/cotizador",
                bg: "bg-ajicolor-purple p-6",
                image: "/hero/le-ponemos-color.jpg",
                imagePosition: "95% center",
                content: (
                  <p className="hero-card-text hero-card-text-left relative z-10 text-white text-2xl lg:text-4xl font-black text-left leading-tight [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">
                    <span className="hero-card-text-compact">
                      Le ponemos <span className="text-ajicolor-yellow">color</span>
                    </span>
                    <span className="hero-card-text-expanded">
                      Le
                      <br />
                      Ponemos
                      <br />
                      <span className="text-ajicolor-yellow">Color</span>
                    </span>
                  </p>
                ),
              },
              {
                href: "/drops",
                bg: "bg-ajicolor-green p-6",
                content: (
                  <p className="hero-card-text relative text-white text-5xl font-black uppercase tracking-wide text-center">
                    Drops
                  </p>
                ),
              },
            ]}
          />
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
                <div className="bg-gray-100 relative overflow-hidden aspect-square">
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
                  <p className="text-xs font-medium text-gray-500 italic mb-2">{product.temporada}</p>
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
    </>
  );
}
