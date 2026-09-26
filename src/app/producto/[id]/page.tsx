import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getProductById, getProductBySlug, getRelatedProducts } from "@/lib/actions/products";
import { getApprovedReviews } from "@/lib/actions/reviews";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import ProductoDetailClient from "./ProductoDetailClient";
import RelatedProducts from "./RelatedProducts";
import ProductReviews from "./ProductReviews";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ajicolor.cl";

/** Acepta el slug (canónico) o el id viejo (compatibilidad con links ya compartidos). */
async function resolveProduct(idOrSlug: string) {
  const bySlug = await getProductBySlug(idOrSlug);
  if (bySlug) return { product: bySlug, matchedBySlug: true };

  const byId = await getProductById(idOrSlug);
  return { product: byId, matchedBySlug: false };
}

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

  const [related, reviews] = await Promise.all([
    getRelatedProducts({ id: product.id, artista: product.artista, collectionId: product.collectionId }),
    getApprovedReviews(product.id),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nombre,
    description: product.descripcion,
    image: product.disenoUrl,
    offers: {
      "@type": "Offer",
      priceCurrency: "CLP",
      price: Number(product.precio),
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/producto/${product.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-ajicolor-light">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader active="/" />

      <ProductoDetailClient product={{ ...product, precio: Number(product.precio) }} />

      <ProductReviews reviews={reviews} />

      {related.length > 0 && (
        <RelatedProducts products={related.map((p) => ({ ...p, precio: Number(p.precio) }))} />
      )}

      <Footer />
    </div>
  );
}
