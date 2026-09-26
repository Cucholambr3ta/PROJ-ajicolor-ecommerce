import { prisma } from "@/lib/prisma";
import CatalogoPageClient from "./CatalogoPageClient";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const productos = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  const productosSerializables = productos.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    descripcion: p.descripcion,
    artista: p.artista,
    temporada: p.temporada,
    variants: p.variants.map((v) => ({ id: v.id, talle: v.talle, color: v.color, stock: v.stock })),
  }));

  return <CatalogoPageClient productos={productosSerializables} />;
}
