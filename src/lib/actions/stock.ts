"use server";

import { prisma } from "@/lib/prisma";

export async function getLowStock() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
  });
  return variants.filter((v) => v.stock <= v.stockMin);
}
