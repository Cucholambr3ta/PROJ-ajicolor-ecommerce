import { prisma } from "@/lib/prisma";
import StockPageClient from "./StockPageClient";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { product: { nombreSlug: "asc" } },
  });

  return <StockPageClient variants={variants} />;
}
