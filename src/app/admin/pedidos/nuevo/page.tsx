import { prisma } from "@/lib/prisma";
import { getPriceRules } from "@/lib/pricing";
import { resolvePrecioFromRules } from "@/lib/pricing-resolve";
import PedidoFormClient from "./PedidoFormClient";

export const dynamic = "force-dynamic";

export default async function NuevoPedidoPage() {
  const [customers, variants, priceRules] = await Promise.all([
    prisma.customer.findMany({ orderBy: { nombre: "asc" } }),
    prisma.productVariant.findMany({
      include: { product: true },
      orderBy: [{ product: { nombre: "asc" } }, { talle: "asc" }],
    }),
    getPriceRules(),
  ]);

  return (
    <PedidoFormClient
      customers={customers.map((c) => ({ id: c.id, nombre: c.nombre, email: c.email }))}
      variants={variants.map((v) => ({
        id: v.id,
        label: `${v.product.nombre} — ${v.color} / ${v.talle} (${v.sku})`,
        // Precio pre-cargado desde la tabla de precios (src/lib/pricing.ts)
        // — el admin lo puede editar a mano en el formulario antes de
        // guardar, igual que hoy (ver PedidoFormClient.tsx).
        precio: resolvePrecioFromRules(v.product, v.talle, priceRules),
        stock: v.stock,
      }))}
    />
  );
}
