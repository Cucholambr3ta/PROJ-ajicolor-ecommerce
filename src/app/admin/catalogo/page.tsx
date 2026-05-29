import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const productos = await prisma.product.findMany({
    include: { variants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Catálogo</h1>
      </div>
      <Card>
        {productos.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No hay productos para mostrar.</div>
        ) : (
          <div className="divide-y">
            {productos.map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.nombreSlug}</p>
                  <p className="text-sm text-gray-500">
                    {p.artista} — {p.temporada}
                  </p>
                  <p className="text-sm text-gray-400 line-clamp-1">{p.descripcion}</p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">
                    {p.variants.length} variante(s)
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
