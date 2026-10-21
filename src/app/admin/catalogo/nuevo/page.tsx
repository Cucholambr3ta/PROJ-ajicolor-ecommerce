import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getColors } from "@/lib/actions/colors";
import { getProductosKidsSinAsignar } from "@/lib/actions/products";
import { getPriceRules } from "@/lib/pricing";
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
    const [kidsDisponibles, reglas] = await Promise.all([
      getProductosKidsSinAsignar(product.kidsVersionId ?? undefined),
      getPriceRules(),
    ]);
    const preciosDelProducto = reglas
      .filter((r) => r.productId === product.id)
      .map((r) => ({ id: r.id, talleDesde: r.talleDesde, talleHasta: r.talleHasta, precio: Number(r.precio) }));
    return (
      <ProductoFormClient
        initialData={product}
        colores={colores}
        kidsDisponibles={kidsDisponibles}
        preciosDelProducto={preciosDelProducto}
      />
    );
  }

  const kidsDisponibles = await getProductosKidsSinAsignar();
  return <ProductoFormClient colores={colores} kidsDisponibles={kidsDisponibles} />;
}
