import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductoFormClient from "./ProductoFormClient";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;

  if (edit) {
    const product = await prisma.product.findUnique({
      where: { id: edit },
      include: { variants: true },
    });
    if (!product) notFound();
    return <ProductoFormClient initialData={product} />;
  }

  return <ProductoFormClient />;
}
