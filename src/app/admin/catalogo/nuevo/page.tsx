import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getColors } from "@/lib/actions/colors";
import ProductoFormClient from "./ProductoFormClient";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const colores = await getColors();

  if (edit) {
    const product = await prisma.product.findUnique({
      where: { id: edit },
      include: { variants: true, images: { orderBy: { orden: "asc" } }, colorImages: true },
    });
    if (!product) notFound();
    return <ProductoFormClient initialData={product} colores={colores} />;
  }

  return <ProductoFormClient colores={colores} />;
}
