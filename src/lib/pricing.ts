"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseOrThrow } from "@/lib/schemas";
import { resolvePrecioFromRules, resolvePrecioDesdeFromRules, type ProductoParaPrecio } from "@/lib/pricing-resolve";
import type { TipoProducto } from "@prisma/client";

const createPriceRuleSchema = z.object({
  tipo: z.enum(["Polera", "Poleron", "Totebag", "Reloj", "Papeleria"]),
  talleDesde: z.string().trim().min(1),
  talleHasta: z.string().trim().min(1),
  precio: z.number().nonnegative(),
  productId: z.string().trim().min(1).optional(),
});

export async function getPriceRules() {
  await requireAdmin();
  return prisma.priceRule.findMany({ orderBy: [{ tipo: "asc" }, { talleDesde: "asc" }] });
}

/** Todas las reglas (globales + overrides de drop), sin auth — para
 * resolver precios en páginas públicas (grillas, ficha, carrito, checkout)
 * con una sola query en vez de una por producto. El precio no es un dato
 * sensible, así que no hace falta requireAdmin acá como en getPriceRules. */
export async function getPriceRulesPublic() {
  return prisma.priceRule.findMany();
}

/** Reglas de un producto puntual (override de drop) + las globales de su
 * tipo — todo lo que ese producto necesita para resolver su precio. */
export async function getPriceRulesForProduct(productId: string, tipo: TipoProducto) {
  return prisma.priceRule.findMany({
    where: { OR: [{ productId }, { productId: null, tipo }] },
  });
}

export async function createPriceRule(data: {
  tipo: TipoProducto;
  talleDesde: string;
  talleHasta: string;
  precio: number;
  productId?: string;
}) {
  await requireAdmin();
  const parsed = parseOrThrow(createPriceRuleSchema, data);
  const rule = await prisma.priceRule.create({ data: parsed });
  revalidatePath("/admin/precios");
  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  return rule;
}

export async function updatePriceRule(id: string, data: { talleDesde?: string; talleHasta?: string; precio?: number }) {
  await requireAdmin();
  const rule = await prisma.priceRule.update({ where: { id }, data });
  revalidatePath("/admin/precios");
  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  return rule;
}

export async function deletePriceRule(id: string) {
  await requireAdmin();
  const rule = await prisma.priceRule.delete({ where: { id } });
  revalidatePath("/admin/precios");
  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  return rule;
}

/** Versión async: resuelve consultando la DB — para call-sites que resuelven
 * un solo producto (ej. agregar al carrito, admin pedido manual) y no
 * quieren cargar reglas a mano. Para resolver muchos productos a la vez
 * (grillas, carrito con varios ítems), cargar reglas una sola vez
 * (getPriceRules/getPriceRulesPublic) y usar resolvePrecioFromRules /
 * resolvePrecioDesdeFromRules de @/lib/pricing-resolve directo, sin pasar
 * por acá — evita una query por ítem. */
export async function resolvePrecio(product: ProductoParaPrecio, talle: string): Promise<number> {
  const rules = await getPriceRulesForProduct(product.id, product.tipo);
  return resolvePrecioFromRules(product, talle, rules);
}

export async function resolvePrecioDesde(product: ProductoParaPrecio): Promise<number> {
  const rules = await getPriceRulesForProduct(product.id, product.tipo);
  return resolvePrecioDesdeFromRules(product, rules);
}
