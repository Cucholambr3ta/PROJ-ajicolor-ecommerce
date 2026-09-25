import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/actions/products";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import ProductoDetailClient from "./ProductoDetailClient";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.artista,
    description: product.descripcion,
    openGraph: {
      title: `${product.artista} | Ajicolor`,
      description: product.descripcion,
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
  const product = await getProductById(id);

  if (!product) notFound();

  return (
    <div className="min-h-screen bg-ajicolor-light">
      <SiteHeader active="/" />

      <ProductoDetailClient product={{ ...product, precio: Number(product.precio) }} />

      <Footer />
    </div>
  );
}
