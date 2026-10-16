import Link from "next/link";
import Image from "next/image";
import { getProducts, getFilterOptions, getActiveCollections, getFeaturedProductsByTipo } from "@/lib/actions/products";
import { getActiveBanners } from "@/lib/actions/banners";
import { getStoreSettings } from "@/lib/actions/settings";
import { CatalogFilters } from "@/components/CatalogFilters";
import { Pagination } from "@/components/Pagination";
import { BannerCarousel } from "@/components/BannerCarousel";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  color?: string;
  talle?: string;
  coleccion?: string;
  tipo?: string;
  orden?: "recientes" | "precio-asc" | "precio-desc";
  page?: string;
}

const TIPO_POR_SLUG: Record<string, "Polera" | "Poleron" | "Totebag" | "Reloj" | "Papeleria"> = {
  poleras: "Polera",
  polerones: "Poleron",
  totebag: "Totebag",
  relojes: "Reloj",
  papeleria: "Papeleria",
};

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) || 1 : 1;

  const tipo = sp.tipo ? TIPO_POR_SLUG[sp.tipo] : undefined;

  const [{ items: products, total, totalPages }, { colores, talles }, collections, banners, settings, productosPorTipo] =
    await Promise.all([
      getProducts({
        q: sp.q,
        color: sp.color,
        talle: sp.talle,
        collectionSlug: sp.coleccion,
        tipo,
        orden: sp.orden,
        page,
      }),
      getFilterOptions(),
      getActiveCollections(),
      getActiveBanners(),
      getStoreSettings(),
      getFeaturedProductsByTipo(),
    ]);

  const hasFilters = !!(sp.q || sp.color || sp.talle || sp.coleccion || sp.tipo);

  return (
    <>
      {!hasFilters && page === 1 && (
        <BannerCarousel
          banners={banners}
          velocidadSeg={settings.bannerVelocidadSeg}
          productosPorTipo={productosPorTipo}
        />
      )}

      <section className="max-w-7xl mx-auto p-8 pt-10">
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
