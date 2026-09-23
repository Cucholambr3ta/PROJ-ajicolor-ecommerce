import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/lib/actions/products";
import CartIcon from "@/components/CartIcon";
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
        <Link href="/" className="text-2xl font-black">
          AJI<span className="text-ajicolor-magenta">COLOR</span>
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
        <p className="text-lg font-black">
          AJI<span className="text-ajicolor-magenta">COLOR</span>
        </p>
      </footer>
    </div>
  );
}
