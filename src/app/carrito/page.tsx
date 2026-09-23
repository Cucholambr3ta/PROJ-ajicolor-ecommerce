import { getCart } from "@/lib/actions/cart";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import CarritoClient from "./CarritoClient";

export const dynamic = "force-dynamic";

export default async function CarritoPage() {
  const cart = await getCart();
  const rawItems = cart?.items ?? [];
  const items = rawItems.map((item) => ({
    ...item,
    variant: {
      ...item.variant,
      product: { ...item.variant.product, precio: Number(item.variant.product.precio) },
    },
  }));
  const total = items.reduce((acc, item) => acc + item.variant.product.precio * item.cantidad, 0);

  return (
    <div className="min-h-screen bg-ajicolor-light">
      <nav className="site-nav">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/" className="font-bold text-xs uppercase hover:underline">
          ← Seguir comprando
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto py-12 p-8">
        <h1 className="text-3xl font-black mb-8 border-b-2 border-ajicolor-ink pb-4">Mi carrito</h1>
        <CarritoClient items={items} total={total} />
      </main>
    </div>
  );
}
