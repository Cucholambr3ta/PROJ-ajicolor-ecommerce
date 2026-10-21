import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { getProductById, getProductBySlug, getRelatedProducts } from "@/lib/actions/products";
import { getApprovedReviews } from "@/lib/actions/reviews";
import { getColorsPublic } from "@/lib/actions/colors";
import { getPriceRulesPublic } from "@/lib/pricing";
import { resolvePrecioDesdeFromRules } from "@/lib/pricing-resolve";
import { getTallaGuiasPublic } from "@/lib/actions/tallaGuia";
import ProductoDetailClient from "./ProductoDetailClient";
import RelatedProducts from "./RelatedProducts";
import ProductReviews from "./ProductReviews";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ajicolor.cl";

/**
 * Acepta el slug (canónico) o el id viejo (compatibilidad con links ya
 * compartidos). Memoizada por request: generateMetadata() y el componente
 * de página la llaman ambos por separado — sin cache() se pagaría el viaje
 * a Supabase dos veces por la misma carga de página.
 */
const resolveProduct = cache(async (idOrSlug: string) => {
  const bySlug = await getProductBySlug(idOrSlug);
  if (bySlug) return { product: bySlug, matchedBySlug: true };

  const byId = await getProductById(idOrSlug);
  return { product: byId, matchedBySlug: false };
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { product } = await resolveProduct(id);
  if (!product) return { title: "Producto no encontrado" };

  const url = `${SITE_URL}/producto/${product.slug}`;
  return {
    title: product.artista,
    description: product.descripcion,
    alternates: { canonical: url },
    openGraph: {
      title: `${product.artista} | Ajicolor`,
      description: product.descripcion,
      url,
      images: [{ url: product.disenoUrl }],
    },
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { product, matchedBySlug } = await resolveProduct(id);

  if (!product) notFound();
  if (!matchedBySlug) redirect(`/producto/${product.slug}`);

  // product queda narrowed a no-null arriba, pero esa narrow no sobrevive
  // dentro de funciones anidadas (TS las trata como posibles closures
  // llamadas más tarde) — se re-liga a una const local para que
  // soloComprables/serializar no vean `Product | null`.
  const prod = product;

  // Producto emparejado (Adulto↔Kids del mismo diseño, ver kidsVersionId en
  // el schema) — puede venir de cualquiera de los dos lados de la relación
  // según si `prod` es el Adulto (kidsVersion) o el Kids (adultoDe).
  const par = prod.kidsVersion ?? prod.adultoDe ?? null;

  const [related, reviews, colores, coloresPar, priceRules, tallaGuias] = await Promise.all([
    getRelatedProducts({ id: prod.id, artista: prod.artista, collectionId: prod.collectionId }),
    getApprovedReviews(prod.id),
    getColorsPublic(prod.categoria),
    par ? getColorsPublic(par.categoria) : Promise.resolve([]),
    getPriceRulesPublic(),
    getTallaGuiasPublic(),
  ]);

  // Solo se puede comprar un color si tiene al menos la foto de frente
  // subida — evita vender una variante que el cliente nunca puede ver
  // (pedido explícito: nada en blanco / "no disponible" en el selector).
  // Se aplica igual al producto principal y a su par (si lo tiene).
  function soloComprables<T extends { variants: typeof prod.variants; colorImages: typeof prod.colorImages }>(
    p: T
  ) {
    const coloresConFoto = new Set(p.colorImages.filter((ci) => ci.lado === "Frente").map((ci) => ci.color));
    return p.variants.filter((v) => coloresConFoto.has(v.color));
  }

  const variantesComprables = soloComprables(prod);
  const variantesComprablesPar = par ? soloComprables(par) : [];

  // El precio real depende del talle elegido (tabla por tipo+rango, ver
  // src/lib/pricing.ts) — JSON-LD no tiene un talle para resolver un precio
  // exacto, así que usa el "desde" (precio más bajo entre las reglas
  // aplicables), igual que las tarjetas de grilla.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: prod.nombre,
    description: prod.descripcion,
    image: prod.disenoUrl,
    offers: {
      "@type": "Offer",
      priceCurrency: "CLP",
      price: resolvePrecioDesdeFromRules(prod, priceRules),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/producto/${prod.slug}`,
    },
  };

  type Serializable = Pick<
    typeof prod,
    "id" | "slug" | "nombre" | "descripcion" | "disenoUrl" | "artista" | "temporada" | "categoria" | "tipo" | "precio" | "images" | "colorImages"
  >;
  function serializar(p: Serializable, variantes: typeof variantesComprables) {
    return {
      id: p.id,
      slug: p.slug,
      nombre: p.nombre,
      descripcion: p.descripcion,
      disenoUrl: p.disenoUrl,
      artista: p.artista,
      temporada: p.temporada,
      categoria: p.categoria,
      tipo: p.tipo,
      precio: Number(p.precio),
      variants: variantes.map((v) => ({ id: v.id, talle: v.talle, color: v.color, stock: v.stock })),
      images: p.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt })),
      colorImages: p.colorImages.map((ci) => ({ color: ci.color, lado: ci.lado, url: ci.url })),
    };
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ProductoDetailClient
        product={serializar(product, variantesComprables)}
        productPar={par ? serializar(par, variantesComprablesPar) : null}
        colores={colores.map((c) => ({ nombre: c.nombre, hex: c.hex }))}
        coloresPar={coloresPar.map((c) => ({ nombre: c.nombre, hex: c.hex }))}
        priceRules={priceRules.map((r) => ({ ...r, precio: Number(r.precio) }))}
        tallaGuias={tallaGuias}
      />

      <ProductReviews reviews={reviews} />

      {related.length > 0 && (
        <RelatedProducts
          products={related.map((p) => ({
            id: p.id,
            slug: p.slug,
            nombre: p.nombre,
            disenoUrl: p.disenoUrl,
            precio: resolvePrecioDesdeFromRules(p, priceRules),
          }))}
        />
      )}
    </>
  );
}
