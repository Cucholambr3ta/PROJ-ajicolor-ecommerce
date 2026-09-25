import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        include: {
          items: { include: { variant: { include: { product: true } } } },
          shipment: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!customer) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/clientes" className="text-sm text-gray-500 hover:underline dark:text-neutral-400">
          ← Volver a Clientes
        </Link>
        <h1 className="text-2xl font-black mt-2">Detalle del Cliente</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3 dark:text-neutral-200">Información del Cliente</h2>
          <form
            action={async (formData: FormData) => {
              "use server";
              const { updateCustomer } = await import("@/lib/actions/customers");
              await updateCustomer(customer.id, {
                nombre: String(formData.get("nombre") ?? ""),
                email: String(formData.get("email") ?? ""),
                telefono: String(formData.get("telefono") ?? ""),
                direccion: String(formData.get("direccion") ?? ""),
              });
              revalidatePath(`/admin/clientes/${customer.id}`);
            }}
            className="space-y-3"
          >
            <p className="text-xs text-gray-400 dark:text-neutral-500">ID: {customer.id}</p>
            <div>
              <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Nombre</label>
              <input
                name="nombre"
                defaultValue={customer.nombre}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={customer.email}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Teléfono</label>
              <input
                name="telefono"
                defaultValue={customer.telefono ?? ""}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Dirección</label>
              <input
                name="direccion"
                defaultValue={customer.direccion ?? ""}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-neutral-500">
              Registro: {customer.fechaRegistro.toLocaleDateString()}
            </p>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md bg-ajicolor-magenta text-white text-xs font-medium hover:opacity-90"
            >
              Guardar cambios
            </button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3 dark:text-neutral-200">Resumen</h2>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <span className="font-medium">Backstage Pass:</span>
              {customer.backstagePass ? <Badge>Activo</Badge> : <Badge variant="outline">Inactivo</Badge>}
            </p>
            {customer.backstagePass && customer.backstagePassExpira && (
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                Expira: {customer.backstagePassExpira.toLocaleDateString()}
              </p>
            )}
            <p><span className="font-medium">Total gastado:</span> <span className="font-bold text-lg">${customer.totalGastado.toFixed(2)}</span></p>
            <p><span className="font-medium">Total pedidos:</span> {customer.orders.length}</p>
            <form
              action={async () => {
                "use server";
                const { activarBackstagePass, desactivarBackstagePass } = await import(
                  "@/lib/actions/customers"
                );
                if (customer.backstagePass) {
                  await desactivarBackstagePass(customer.id);
                } else {
                  await activarBackstagePass(customer.id);
                }
              }}
            >
              <button
                type="submit"
                className="mt-2 px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                {customer.backstagePass ? "Desactivar Backstage Pass" : "Activar Backstage Pass (30 días)"}
              </button>
            </form>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-700 mb-3 dark:text-neutral-200">Historial de Pedidos</h2>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-neutral-400">No hay pedidos registrados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 dark:border-neutral-700 dark:text-neutral-400">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Canal</th>
                <th className="pb-2">Items</th>
                <th className="pb-2 text-right">Total</th>
                <th className="pb-2 text-center">Estado</th>
                <th className="pb-2 text-center">Envío</th>
                <th className="pb-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.map((o) => (
                <tr key={o.id} className="border-b last:border-0 dark:border-neutral-700">
                  <td className="py-2">{o.createdAt.toLocaleDateString()}</td>
                  <td className="py-2">{o.canal}</td>
                  <td className="py-2">{o.items.length} item(s)</td>
                  <td className="py-2 text-right font-medium">${Number(o.total).toFixed(2)}</td>
                  <td className="py-2 text-center">
                    <Badge variant="outline">{o.estado}</Badge>
                  </td>
                  <td className="py-2 text-center">
                    {o.shipment ? (
                      <Badge variant="secondary">{o.shipment.estado}</Badge>
                    ) : (
                      <span className="text-gray-400 dark:text-neutral-500">—</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="text-ajicolor-magenta text-xs font-medium hover:underline"
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
