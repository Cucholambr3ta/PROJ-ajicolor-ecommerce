import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProducts, getFilterOptions } from "@/lib/actions/products";
import { CatalogFilters } from "@/components/CatalogFilters";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Kids | Ajicolor",
  description: "Poleras de bandas para los más chicos — mismo estampado, talles infantiles.",
};

interface SearchParams {
  q?: string;
  color?: string;
  talle?: string;
  orden?: "recientes" | "precio-asc" | "precio-desc";
  page?: string;
}

export default async function KidsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const page = sp.page ? parseInt(sp.page, 10) || 1 : 1;

  const [{ items: products, total, totalPages }, { colores, talles }] = await Promise.all([
    getProducts({
      categoria: "Kids",
      q: sp.q,
      color: sp.color,
      talle: sp.talle,
      orden: sp.orden,
      page,
    }),
    getFilterOptions("Kids"),
  ]);

  return (
    <section className="max-w-7xl mx-auto p-8 pt-10">
      <div className="flex justify-between items-end mb-6 border-b-2 border-ajicolor-ink pb-4">
        <div>
          <h1 className="text-4xl font-black text-ajicolor-purple dark:text-neutral-100">Kids</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-400">
            Las mismas bandas, en talles para los más chicos.
          </p>
        </div>
        <span className="text-xs font-bold text-gray-400 dark:text-neutral-500 uppercase">
          {total} producto{total !== 1 ? "s" : ""}
        </span>
      </div>

      <CatalogFilters colores={colores} talles={talles} collections={[]} />

      {products.length === 0 ? (
        <p className="text-center text-gray-400 dark:text-neutral-500 font-medium py-20">
          Todavía no hay productos Kids publicados.
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
        basePath="/kids"
        searchParams={{ q: sp.q, color: sp.color, talle: sp.talle, orden: sp.orden }}
      />
    </section>
  );
}
