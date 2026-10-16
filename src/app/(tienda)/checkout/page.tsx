import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/actions/cart";
import { getStoreSettings } from "@/lib/actions/settings";
import Link from "next/link";
import CheckoutClient from "./CheckoutClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Confirmar compra", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const session = await auth();
  const esCliente = session?.user?.rol === "Cliente";

  // Carrito libre: se puede llegar al checkout sin sesión (invitado). Si
  // hay sesión de cliente, se precargan sus datos y direcciones guardadas;
  // si no, el formulario pide email/dirección desde cero.
  const customer = esCliente
    ? await prisma.customer.findUnique({ where: { id: session!.user.id as string } })
    : null;

  const [cart, settings, addresses] = await Promise.all([
    getCart(),
    getStoreSettings(),
    customer
      ? prisma.address.findMany({
          where: { customerId: customer.id },
          orderBy: [{ esPrincipal: "desc" }, { createdAt: "desc" }],
        })
      : Promise.resolve([]),
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
        disenoUrl: item.variant.product.disenoUrl,
      },
    },
  }));
  const subtotal = items.reduce((acc, item) => acc + item.variant.product.precio * item.cantidad, 0);

  return (
    <>

      <main className="max-w-6xl mx-auto py-12 p-8">
        <Link href="/carrito" className="inline-block font-bold text-xs uppercase hover:underline mb-4">
          ← Volver al carrito
        </Link>
        <h1 className="text-3xl font-black mb-8 border-b-2 border-ajicolor-ink pb-4">Confirmar compra</h1>
        <CheckoutClient
          customer={
            customer ? { nombre: customer.nombre, telefono: customer.telefono ?? "", direccion: customer.direccion ?? "" } : null
          }
          addresses={addresses}
          items={items}
          subtotal={subtotal}
          costoEnvioCorreos={Number(settings.costoEnvioCorreos)}
          whatsapp={settings.whatsapp}
        />
      </main>
    </>
  );
}
