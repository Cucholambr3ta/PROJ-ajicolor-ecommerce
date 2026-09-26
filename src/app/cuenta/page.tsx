import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import CuentaClient from "./CuentaClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false, follow: false } };

export default async function CuentaPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.rol !== "Cliente") redirect("/login-cliente?callbackUrl=/cuenta");

  const customerId = session.user.id;

  const [customer, addresses, favorites] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        orders: {
          include: { items: true, shipment: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.address.findMany({
      where: { customerId },
      orderBy: [{ esPrincipal: "desc" }, { createdAt: "desc" }],
    }),
    prisma.favorite.findMany({
      where: { customerId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!customer) redirect("/login-cliente");

  return (
    <div className="min-h-screen bg-ajicolor-light">
      <SiteHeader />

      <main className="max-w-5xl mx-auto py-12 p-8">
        <h1 className="text-3xl font-black mb-8 border-b-2 border-ajicolor-ink pb-4">Mi cuenta</h1>
        <CuentaClient
          customer={{
            id: customer.id,
            nombre: customer.nombre,
            email: customer.email,
            telefono: customer.telefono,
            direccion: customer.direccion,
            image: customer.image,
            fechaRegistro: customer.fechaRegistro.toISOString(),
            totalGastado: Number(customer.totalGastado),
            backstagePass: customer.backstagePass,
            tienePassword: !!customer.passwordHash,
          }}
          orders={customer.orders.map((order) => ({
            id: order.id,
            numero: order.numero,
            estado: order.estado,
            total: Number(order.total),
            createdAt: order.createdAt.toISOString(),
            itemsCount: order.items.length,
            transportista: order.shipment?.transportista ?? null,
            trackingNumber: order.shipment?.trackingNumber ?? null,
          }))}
          addresses={addresses}
          favorites={favorites.map((f) => ({
            id: f.id,
            productId: f.productId,
            slug: f.product.slug,
            nombre: f.product.nombre,
            disenoUrl: f.product.disenoUrl,
            precio: Number(f.product.precio),
          }))}
        />
      </main>

      <Footer />
    </div>
  );
}
