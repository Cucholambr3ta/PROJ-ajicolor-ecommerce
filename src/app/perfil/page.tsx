import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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
    <div className="min-h-screen bg-ajicolor-paper">
      <nav className="mockup-nav">
        <Link href="/" className="text-4xl font-black italic toon-script text-ajicolor-magenta tracking-tighter">
          Ajicolor
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/" className="font-black text-xs uppercase hover:underline">
            Continue Shopping
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button className="bg-ajicolor-yellow px-6 py-2 thick-border font-black uppercase text-xs">
              Logout
            </button>
          </form>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-20 p-8">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 thick-border pop-shadow text-center">
              <div className="w-32 h-32 bg-ajicolor-purple thick-border mx-auto mb-6 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(customer.nombre)}`}
                  alt="Avatar"
                  className="w-24 h-24"
                />
              </div>
              <h2 className="text-3xl font-black uppercase mb-2">{customer.nombre}</h2>
              <p className="text-xs font-black uppercase tracking-widest text-ajicolor-magenta mb-6">
                Ajicolor Member desde {customer.fechaRegistro.getFullYear()}
              </p>
              <div className="h-1 bg-ajicolor-ink w-full mb-6" />
              <div className="text-left space-y-4 text-sm font-bold opacity-60">
                <p>📍 {customer.direccion}</p>
                <p>📧 {customer.email}</p>
                <p>📱 {customer.telefono}</p>
              </div>
            </div>

            <div className="bg-ajicolor-yellow p-8 thick-border rotate-[-2deg] shadow-[10px_10px_0px_var(--ink)]">
              <h3 className="text-2xl font-black uppercase mb-4">Loyalty Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between font-black uppercase text-xs">
                  <span>Pedidos totales</span>
                  <span>{customer.orders.length}</span>
                </div>
                <div className="flex justify-between font-black uppercase text-xs">
                  <span>Total gastado</span>
                  <span className="text-ajicolor-magenta">${Number(customer.totalGastado).toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-black uppercase text-xs">
                  <span>Backstage Pass</span>
                  <span className="text-ajicolor-magenta">{customer.backstagePass ? "V.I.P." : "—"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-12">
            <h2 className="text-6xl font-black italic uppercase border-b-8 border-ajicolor-ink pb-4">
              Order History
            </h2>

            {customer.orders.length === 0 ? (
              <div className="p-10 border-4 border-ajicolor-ink border-dashed text-center">
                <p className="toon-script text-3xl opacity-30">No more records in the jukebox...</p>
              </div>
            ) : (
              customer.orders.map((order) => {
                const isDelivered = order.estado === "Entregado";
                return (
                  <div
                    key={order.id}
                    className={`bg-white p-8 thick-border relative flex flex-col md:flex-row gap-8 items-center ${
                      isDelivered ? "magenta-shadow" : "pop-shadow opacity-80"
                    }`}
                  >
                    <div className="flex-grow">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="bg-ajicolor-ink text-white px-3 py-1 text-[10px] font-black uppercase">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-xs font-bold opacity-30">
                          Ordered {order.createdAt.toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-3xl font-black uppercase mb-4">
                        {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-3 py-1 border-2 border-ajicolor-ink font-black text-[10px] uppercase italic ${
                            isDelivered ? "bg-ajicolor-green text-white" : "bg-ajicolor-yellow text-ajicolor-ink"
                          }`}
                        >
                          {order.estado}
                        </div>
                        {order.shipment?.transportista && (
                          <p className="text-xs font-bold opacity-50">Sent via {order.shipment.transportista}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-4xl font-black text-ajicolor-purple mb-4">${Number(order.total).toFixed(0)}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <footer className="p-10 bg-ajicolor-purple text-white text-center">
        <p className="text-[10px] uppercase font-black tracking-widest opacity-40">
          {customer.nombre}&apos;s Secret Vault // Ajicolor Secure Access
        </p>
      </footer>
    </div>
  );
}
