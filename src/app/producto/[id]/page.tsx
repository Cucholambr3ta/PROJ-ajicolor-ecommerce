import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/lib/actions/products";
import CartIcon from "@/components/CartIcon";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
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
      <nav className="site-nav">
        <Link href="/">
          <Logo />
        </Link>
        <div className="hidden lg:flex gap-10 font-bold text-sm text-ajicolor-purple">
          <Link href="/conoce-al-aji">Conoce al Ají</Link>
          <Link href="/">Catálogo</Link>
          <Link href="/contacto">Contacto</Link>
        </div>
        <div className="flex items-center gap-4">
          <CartIcon />
          <Link href="/" className="font-bold text-xs uppercase hover:underline">
            ← Volver al catálogo
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <ProductoDetailClient product={{ ...product, precio: Number(product.precio) }} />

      <Footer />
    </div>
  );
}
