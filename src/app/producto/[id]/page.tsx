import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/lib/actions/products";
import CartIcon from "@/components/CartIcon";
import { Logo } from "@/components/Logo";
import ProductoDetailClient from "./ProductoDetailClient";

export const dynamic = "force-dynamic";

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
        <div className="flex items-center gap-4">
          <CartIcon />
          <Link href="/" className="font-bold text-xs uppercase hover:underline">
            ← Volver al catálogo
          </Link>
        </div>
      </nav>

      <ProductoDetailClient product={product} />

      <footer className="bg-white border-t-2 border-ajicolor-ink py-10 text-center">
        <div className="flex justify-center">
          <Logo className="h-8 w-auto" />
        </div>
      </footer>
    </div>
  );
}
