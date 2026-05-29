import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true },
  });

  if (!product) notFound();

  const stockTotal = product.variants.reduce((acc, v) => acc + v.stock, 0);

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/catalogo" className="text-sm text-gray-500 hover:underline">
          ← Volver a Catálogo
        </Link>
        <div className="flex items-center justify-between mt-2">
          <h1 className="text-2xl font-bold">Detalle del Producto</h1>
          <Link
            href={`/admin/catalogo/nuevo?edit=${product.id}`}
            className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Editar producto
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Información del Producto</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">ID:</span> {product.id}</p>
            <p><span className="font-medium">Nombre/Slug:</span> {product.nombreSlug}</p>
            <p><span className="font-medium">Artista:</span> {product.artista}</p>
            <p><span className="font-medium">Temporada:</span> {product.temporada}</p>
            <p><span className="font-medium">Descripción:</span> {product.descripcion}</p>
            <p><span className="font-medium">Creado:</span> {product.createdAt.toLocaleDateString()}</p>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-gray-700 mb-3">Resumen</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Variantes:</span> {product.variants.length}</p>
            <p><span className="font-medium">Stock total:</span> {stockTotal} u.</p>
            {product.disenoUrl && (
              <p>
                <span className="font-medium">Diseño:</span>{" "}
                <a
                  href={product.disenoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ajicolor-magenta hover:underline"
                >
                  Ver diseño
                </a>
              </p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-gray-700 mb-3">Variantes</h2>
        {product.variants.length === 0 ? (
          <p className="text-sm text-gray-500">No hay variantes registradas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">SKU</th>
                <th className="pb-2">Talle</th>
                <th className="pb-2">Color</th>
                <th className="pb-2 text-right">Stock</th>
                <th className="pb-2 text-right">Stock Mín.</th>
                <th className="pb-2 text-right">Estado</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((v) => (
                <tr key={v.id} className="border-b last:border-0">
                  <td className="py-2 font-mono text-xs">{v.sku}</td>
                  <td className="py-2">{v.talle}</td>
                  <td className="py-2">{v.color}</td>
                  <td className="py-2 text-right font-medium">{v.stock}</td>
                  <td className="py-2 text-right text-gray-500">{v.stockMin}</td>
                  <td className="py-2 text-right">
                    {v.stock <= v.stockMin ? (
                      <Badge variant="destructive">Bajo</Badge>
                    ) : (
                      <Badge variant="outline">OK</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
