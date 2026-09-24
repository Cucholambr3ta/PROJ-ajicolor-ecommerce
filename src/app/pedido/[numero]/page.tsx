import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Confirmación de pedido", robots: { index: false, follow: false } };

export default async function PedidoConfirmacionPage({
  params,
}: {
  params: Promise<{ numero: string }>;
}) {
  const { numero } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login-cliente");

  const numeroInt = parseInt(numero, 10);
  if (Number.isNaN(numeroInt)) notFound();

  const order = await prisma.order.findUnique({
    where: { numero: numeroInt },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!order || order.customerId !== session.user.id) notFound();

  return (
    <div className="min-h-screen bg-ajicolor-light">
      <nav className="site-nav">
        <Link href="/">
          <Logo />
        </Link>
        <Link href="/perfil" className="font-bold text-xs uppercase hover:underline">
          Ir a mi perfil
        </Link>
      </nav>

      <main className="max-w-2xl mx-auto py-16 p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-ajicolor-green mx-auto mb-6 flex items-center justify-center text-white text-4xl font-black">
          ✓
        </div>
        <h1 className="text-3xl font-black mb-2">¡Pedido confirmado!</h1>
        <p className="text-gray-500 mb-8">
          Orden <span className="font-black text-ajicolor-magenta">#{String(order.numero).padStart(4, "0")}</span>
        </p>

        <div className="bg-white thick-border pop-shadow p-6 text-left mb-6">
          <h2 className="font-black uppercase text-sm mb-4">Items</h2>
          <div className="space-y-2 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-gray-600">
                <span>
                  {item.variant.product.nombreSlug} ({item.variant.talle}/{item.variant.color}) ×{item.cantidad}
                </span>
                <span>${(item.cantidad * Number(item.precioUnit)).toLocaleString("es-CL")}</span>
              </div>
            ))}
          </div>
          <div className="h-px bg-gray-200 my-4" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toLocaleString("es-CL")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span>${Number(order.costoEnvio).toLocaleString("es-CL")}</span>
            </div>
            <div className="flex justify-between font-black text-lg text-ajicolor-magenta pt-2">
              <span>Total</span>
              <span>${Number(order.total).toLocaleString("es-CL")}</span>
            </div>
          </div>
        </div>

        <div className="bg-white thick-border pop-shadow p-6 text-left mb-6">
          <h2 className="font-black uppercase text-sm mb-4">Envío a</h2>
          <p className="text-sm text-gray-600">
            {order.envioNombre}<br />
            {order.envioCalle} {order.envioNumero}, {order.envioComuna}, {order.envioRegion}<br />
            {order.envioTelefono}
          </p>
        </div>

        <div className="bg-ajicolor-yellow thick-border pop-shadow p-6 text-left">
          <h2 className="font-black uppercase text-sm mb-2">Instrucciones de pago</h2>
          <p className="text-sm text-gray-800">
            Tu pedido está <strong>pendiente de transferencia</strong>. Nos pondremos en contacto contigo
            por WhatsApp o email con los datos bancarios para completar el pago. Una vez confirmada la
            transferencia, tu pedido pasa a producción.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
