import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { product: { nombreSlug: "asc" } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Inventario</h1>
      </div>
      <Card>
        {variants.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay stock para mostrar.</div>
        ) : (
          <div className="divide-y">
            {variants.map((v) => (
              <div key={v.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{v.product.nombreSlug}</p>
                  <p className="text-sm text-gray-500">
                    {v.talle} / {v.color} — SKU: {v.sku}
                  </p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <span className="font-bold">{v.stock} u.</span>
                  {v.stock <= v.stockMin && (
                    <Badge variant="destructive">Bajo</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
