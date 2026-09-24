import { prisma } from "@/lib/prisma";
import { getSuppliers } from "@/lib/actions/suppliers";
import ProduccionFormClient from "./ProduccionFormClient";

export const dynamic = "force-dynamic";

export default async function NuevoLotePage() {
  const [suppliers, variants] = await Promise.all([
    getSuppliers(),
    prisma.productVariant.findMany({
      include: { product: true },
      orderBy: [{ product: { nombreSlug: "asc" } }, { talle: "asc" }],
    }),
  ]);

  return (
    <ProduccionFormClient
      suppliers={suppliers.map((s) => ({ id: s.id, nombre: s.nombre }))}
      variants={variants.map((v) => ({
        id: v.id,
        label: `${v.product.nombreSlug} — ${v.color} / ${v.talle} (${v.sku})`,
      }))}
    />
  );
}
