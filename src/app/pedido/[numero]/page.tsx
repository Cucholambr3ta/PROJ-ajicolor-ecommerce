import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getStoreSettings } from "@/lib/actions/settings";
import { formatCLP } from "@/lib/format";
import ReportarPagoForm from "./ReportarPagoForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Confirmación de pedido", robots: { index: false, follow: false } };

const ESTADO_LABELS: Record<string, string> = {
  Pendiente: "Pendiente de pago",
  Pagado: "Pago confirmado",
  EnProduccion: "En producción",
  ListoParaEnvio: "Listo para enviar",
  Enviado: "Enviado",
  Entregado: "Entregado",
  Cancelado: "Cancelado",
};

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
    include: {
      items: { include: { variant: { include: { product: true } } } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order || order.customerId !== session.user.id) notFound();

  const settings = await getStoreSettings();
  const pagoEnRevision = order.payments.some((p) => p.estado === "EnRevision");
  const yaPago = order.estadoPago === "Pagado";

  return (
    <div className="min-h-screen bg-ajicolor-light">
      <nav className="site-nav">
        <Link href="/">
          <Logo />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/perfil" className="font-bold text-xs uppercase hover:underline">
            Ir a mi perfil
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-16 p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-ajicolor-green mx-auto mb-6 flex items-center justify-center text-white text-4xl font-black">
          ✓
        </div>
        <h1 className="text-3xl font-black mb-2">¡Pedido recibido!</h1>
        <p className="text-gray-500 dark:text-neutral-400 mb-2">
          Orden <span className="font-black text-ajicolor-magenta">#{String(order.numero).padStart(4, "0")}</span>
        </p>
        <p className="text-sm font-bold uppercase tracking-wide text-ajicolor-purple mb-8">
          {ESTADO_LABELS[order.estado] ?? order.estado}
        </p>

        <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6 text-left mb-6">
          <h2 className="font-black uppercase text-sm mb-4">Items</h2>
          <div className="space-y-2 text-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-gray-600 dark:text-neutral-300">
                <span>
                  {item.variant.product.nombre} ({item.variant.talle}/{item.variant.color}) ×{item.cantidad}
                </span>
                <span>{formatCLP(item.cantidad * Number(item.precioUnit))}</span>
              </div>
            ))}
          </div>
          <div className="h-px bg-gray-200 dark:bg-neutral-700 my-4" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-neutral-300">
              <span>Subtotal</span>
              <span>{formatCLP(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-neutral-300">
              <span>Envío</span>
              <span>{Number(order.costoEnvio) > 0 ? formatCLP(Number(order.costoEnvio)) : "Por pagar"}</span>
            </div>
            <div className="flex justify-between font-black text-lg text-ajicolor-magenta pt-2">
              <span>Total</span>
              <span>{formatCLP(Number(order.total))}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6 text-left mb-6">
          <h2 className="font-black uppercase text-sm mb-4">Envío a</h2>
          <p className="text-sm text-gray-600 dark:text-neutral-300">
            {order.envioNombre}<br />
            {order.envioCalle} {order.envioNumero}, {order.envioComuna}, {order.envioRegion}<br />
            {order.envioTelefono}
          </p>
        </div>

        {yaPago ? (
          <div className="bg-ajicolor-green/20 thick-border pop-shadow p-6 text-left">
            <h2 className="font-black uppercase text-sm mb-2">Pago confirmado</h2>
            <p className="text-sm text-gray-800 dark:text-neutral-200">
              Tu pedido está en producción. El plazo de entrega comprometido es de 5 a 7 días hábiles
              desde la confirmación del pago.
              {order.fechaCompromiso && (
                <> Fecha estimada: <strong>{order.fechaCompromiso.toLocaleDateString("es-CL")}</strong>.</>
              )}
            </p>
          </div>
        ) : pagoEnRevision ? (
          <div className="bg-ajicolor-yellow/40 thick-border pop-shadow p-6 text-left">
            <h2 className="font-black uppercase text-sm mb-2">Comprobante en revisión</h2>
            <p className="text-sm text-gray-800 dark:text-neutral-200">
              Recibimos tu comprobante y lo estamos revisando. Te avisaremos apenas confirmemos el pago.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-ajicolor-yellow thick-border pop-shadow p-6 text-left mb-6">
              <h2 className="font-black uppercase text-sm mb-2">Instrucciones de pago</h2>
              <p className="text-sm text-gray-800 mb-4">
                Tu pedido está <strong>pendiente de transferencia</strong>. Realiza el depósito o
                transferencia con los siguientes datos e indica tu número de orden en el comentario.
              </p>
              <div className="bg-white/60 rounded-md p-4 text-sm text-gray-800 space-y-1 mb-4">
                <p><strong>Nombre:</strong> {settings.bancoTitular ?? "—"}</p>
                <p><strong>RUT:</strong> {settings.bancoRut ?? "—"}</p>
                <p><strong>Banco:</strong> {settings.bancoNombre ?? "—"}</p>
                <p><strong>Tipo de cuenta:</strong> {settings.bancoTipoCuenta ?? "—"}</p>
                <p><strong>Número de cuenta:</strong> {settings.bancoNumeroCuenta ?? "—"}</p>
                <p><strong>Correo:</strong> {settings.bancoEmail ?? "—"}</p>
              </div>
              <p className="text-sm text-gray-800">
                Una vez confirmada la transferencia, tu pedido pasa a producción. El plazo de producción
                es de {settings.plazoProduccionDias} días hábiles desde la confirmación del pago.
              </p>
            </div>

            <ReportarPagoForm orderId={order.id} monto={Number(order.total)} />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
