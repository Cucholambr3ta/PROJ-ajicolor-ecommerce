import { prisma } from "@/lib/prisma";
import { getSuppliers } from "@/lib/actions/suppliers";
import { getItemsPorProducir } from "@/lib/actions/production";
import ProduccionFormClient from "./ProduccionFormClient";

export const dynamic = "force-dynamic";

export default async function NuevoLotePage() {
  const [suppliers, variants, porProducir] = await Promise.all([
    getSuppliers(),
    prisma.productVariant.findMany({
      include: { product: true },
      orderBy: [{ product: { nombre: "asc" } }, { talle: "asc" }],
    }),
    getItemsPorProducir(),
  ]);

  return (
    <ProduccionFormClient
      suppliers={suppliers.map((s) => ({ id: s.id, nombre: s.nombre }))}
      variants={variants.map((v) => ({
        id: v.id,
        label: `${v.product.nombre} — ${v.color} / ${v.talle} (${v.sku})`,
      }))}
      sugeridos={porProducir.agrupadoPorVariante}
    />
  );
}
