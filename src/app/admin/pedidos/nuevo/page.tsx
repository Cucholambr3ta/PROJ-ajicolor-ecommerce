import { prisma } from "@/lib/prisma";
import PedidoFormClient from "./PedidoFormClient";

export const dynamic = "force-dynamic";

export default async function NuevoPedidoPage() {
  const [customers, variants] = await Promise.all([
    prisma.customer.findMany({ orderBy: { nombre: "asc" } }),
    prisma.productVariant.findMany({
      include: { product: true },
      orderBy: [{ product: { nombre: "asc" } }, { talle: "asc" }],
    }),
  ]);

  return (
    <PedidoFormClient
      customers={customers.map((c) => ({ id: c.id, nombre: c.nombre, email: c.email }))}
      variants={variants.map((v) => ({
        id: v.id,
        label: `${v.product.nombre} — ${v.color} / ${v.talle} (${v.sku})`,
        precio: Number(v.product.precio),
        stock: v.stock,
      }))}
    />
  );
}
