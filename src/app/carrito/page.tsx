import type { Metadata } from "next";
import { getCart } from "@/lib/actions/cart";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import CarritoClient from "./CarritoClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mi carrito", robots: { index: false, follow: false } };

export default async function CarritoPage() {
  const cart = await getCart();
  const rawItems = cart?.items ?? [];
  const items = rawItems.map((item) => ({
    id: item.id,
    cantidad: item.cantidad,
    variant: {
      talle: item.variant.talle,
      color: item.variant.color,
      stock: item.variant.stock,
      product: {
        id: item.variant.product.id,
        nombre: item.variant.product.nombre,
        disenoUrl: item.variant.product.disenoUrl,
        precio: Number(item.variant.product.precio),
      },
    },
  }));
  const total = items.reduce((acc, item) => acc + item.variant.product.precio * item.cantidad, 0);

  return (
    <div className="min-h-screen bg-ajicolor-light dark:bg-[var(--bg-light)]">
      <SiteHeader active="/" />

      <main className="max-w-3xl mx-auto py-12 p-8">
        <Link href="/" className="inline-block font-bold text-xs uppercase hover:underline mb-4">
          ← Seguir comprando
        </Link>
        <h1 className="text-3xl font-black mb-8 border-b-2 border-ajicolor-ink pb-4">Mi carrito</h1>
        <CarritoClient items={items} total={total} />
      </main>

      <Footer />
    </div>
  );
}
