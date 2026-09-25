import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/actions/cart";
import { getStoreSettings } from "@/lib/actions/settings";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Confirmar compra", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login-cliente");

  const customer = await prisma.customer.findUnique({ where: { id: session.user.id as string } });
  if (!customer) redirect("/login-cliente");

  const [cart, settings, addresses] = await Promise.all([
    getCart(),
    getStoreSettings(),
    prisma.address.findMany({
      where: { customerId: customer.id },
      orderBy: [{ esPrincipal: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const rawItems = cart?.items ?? [];
  if (rawItems.length === 0) redirect("/carrito");

  const items = rawItems.map((item) => ({
    id: item.id,
    cantidad: item.cantidad,
    variant: {
      talle: item.variant.talle,
      color: item.variant.color,
      product: {
        nombre: item.variant.product.nombre,
        precio: Number(item.variant.product.precio),
      },
    },
  }));
  const subtotal = items.reduce((acc, item) => acc + item.variant.product.precio * item.cantidad, 0);

  return (
    <div className="min-h-screen bg-ajicolor-light dark:bg-[var(--bg-light)]">
      <SiteHeader />

      <main className="max-w-3xl mx-auto py-12 p-8">
        <Link href="/carrito" className="inline-block font-bold text-xs uppercase hover:underline mb-4">
          ← Volver al carrito
        </Link>
        <h1 className="text-3xl font-black mb-8 border-b-2 border-ajicolor-ink pb-4">Confirmar compra</h1>
        <CheckoutClient
          customer={{ nombre: customer.nombre, telefono: customer.telefono ?? "", direccion: customer.direccion ?? "" }}
          addresses={addresses}
          items={items}
          subtotal={subtotal}
          costoEnvioCorreos={Number(settings.costoEnvioCorreos)}
          whatsapp={settings.whatsapp}
        />
      </main>

      <Footer />
    </div>
  );
}
