import { prisma } from "@/lib/prisma";
import CatalogoPageClient from "./CatalogoPageClient";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const productos = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  const productosSerializables = productos.map((p) => ({ ...p, precio: Number(p.precio) }));

  return <CatalogoPageClient productos={productosSerializables} />;
}
