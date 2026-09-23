import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CartIcon from "@/components/CartIcon";

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const session = await auth();
  const customer = await prisma.customer.findUnique({
    where: { id: session!.user!.id as string },
    include: {
      orders: {
        include: { items: true, shipment: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-ajicolor-light">
      <nav className="site-nav">
        <Link href="/" className="text-2xl font-black">
          AJI<span className="text-ajicolor-magenta">COLOR</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xs uppercase hover:underline">
            Seguir comprando
          </Link>
          <CartIcon />
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="btn-block bg-ajicolor-yellow">Logout</button>
          </form>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-16 p-8">
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 thick-border pop-shadow text-center">
              <div className="w-28 h-28 rounded-full bg-ajicolor-purple mx-auto mb-5 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(customer.nombre)}`}
                  alt="Avatar"
                  className="w-20 h-20"
                />
              </div>
              <h2 className="text-xl font-black mb-1">{customer.nombre}</h2>
              <p className="text-xs font-bold uppercase tracking-widest text-ajicolor-magenta mb-5">
                Miembro desde {customer.fechaRegistro.getFullYear()}
              </p>
              <div className="h-px bg-gray-200 w-full mb-5" />
              <div className="text-left space-y-2 text-sm font-medium text-gray-600">
                <p>📍 {customer.direccion}</p>
                <p>📧 {customer.email}</p>
                <p>📱 {customer.telefono}</p>
              </div>
            </div>

            <div className="bg-ajicolor-yellow p-6 thick-border pop-shadow rotate-[-1deg]">
              <h3 className="font-black uppercase mb-3">Estatus de cliente</h3>
              <div className="space-y-2 text-xs font-bold uppercase">
                <div className="flex justify-between">
                  <span>Pedidos totales</span>
                  <span>{customer.orders.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total gastado</span>
                  <span className="text-ajicolor-magenta">${Number(customer.totalGastado).toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nivel de fan</span>
                  <span className="text-ajicolor-magenta">{customer.backstagePass ? "V.I.P." : "—"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-black border-b-2 border-ajicolor-ink pb-3">Historial de compra</h2>

            {customer.orders.length === 0 ? (
              <div className="p-10 border-2 border-dashed border-gray-300 text-center">
                <p className="text-gray-400 font-medium">Sin pedidos todavía.</p>
              </div>
            ) : (
              customer.orders.map((order) => {
                const isDelivered = order.estado === "Entregado";
                return (
                  <div key={order.id} className="bg-white p-6 thick-border pop-shadow flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div>
                      <span className="inline-block bg-ajicolor-ink text-white px-3 py-1 text-[10px] font-bold uppercase mb-3">
                        Orden #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <h3 className="text-lg font-black mb-1">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </h3>
                      <p className="text-xs font-medium text-gray-400 mb-2">
                        {order.createdAt.toLocaleDateString()}
                        {order.shipment?.transportista && ` · ${order.shipment.transportista}`}
                      </p>
                      {!isDelivered && (
                        <span className="btn-block bg-ajicolor-yellow text-[10px] py-1.5 px-3">Sigue tu envío</span>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-2xl font-black text-ajicolor-magenta">${Number(order.total).toFixed(0)}</p>
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase ${isDelivered ? "bg-ajicolor-green text-white" : "bg-gray-100 text-gray-600"}`}>
                        {order.estado}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
