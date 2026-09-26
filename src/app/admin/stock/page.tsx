import { prisma } from "@/lib/prisma";
import StockPageClient from "./StockPageClient";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { product: { nombre: "asc" } },
  });

  const variantsSerializables = variants.map((v) => ({
    ...v,
    product: { ...v.product, precio: Number(v.product.precio) },
  }));

  return <StockPageClient variants={variantsSerializables} />;
}
