import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/lib/actions/products";

export const dynamic = "force-dynamic";

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  const talles = Array.from(new Set(product.variants.map((v) => v.talle)));
  const stockTotal = product.variants.reduce((acc, v) => acc + v.stock, 0);

  return (
    <div className="min-h-screen bg-ajicolor-light">
      <nav className="site-nav">
        <Link href="/" className="text-2xl font-black">
          AJI<span className="text-ajicolor-magenta">COLOR</span>
        </Link>
        <Link href="/" className="font-bold text-xs uppercase hover:underline">
          ← Volver al catálogo
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto py-12 p-8">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="thick-border pop-shadow bg-white p-3 mb-2">
              <p className="text-center font-black text-sm py-2 border-b-2 border-ajicolor-ink mb-3">Producto</p>
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.disenoUrl} alt={product.nombreSlug} className="w-full aspect-square object-cover" />
                {stockTotal === 0 && (
                  <span className="absolute top-2 left-2 bg-ajicolor-magenta text-white px-3 py-1 text-[10px] font-bold uppercase">
                    Sold out
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <h1 className="text-5xl font-black text-ajicolor-purple leading-none mb-1">{product.nombreSlug}</h1>
            <p className="text-2xl text-ajicolor-magenta italic font-medium mb-6">{product.temporada}</p>

            <p className="text-4xl font-black text-ajicolor-magenta mb-8">
              {stockTotal === 0 ? "Sin stock" : `${stockTotal} unidades disponibles`}
            </p>

            {talles.length > 0 && (
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-widest mb-3">Selecciona tu talla</p>
                <div className="flex gap-2 flex-wrap">
                  {talles.map((t, i) => (
                    <span
                      key={t}
                      className={`w-12 h-12 flex items-center justify-center thick-border font-black text-sm ${
                        i === 0 ? "bg-ajicolor-ink text-white" : "bg-white"
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="bg-ajicolor-ink text-white px-3 py-1.5 text-xs font-bold uppercase inline-block mb-0">
                Especificación técnica
              </p>
              <div className="thick-border p-4 text-sm italic text-gray-600 font-medium">
                {product.descripcion}
                <br />
                Por {product.artista}
              </div>
            </div>

            <button
              disabled={stockTotal === 0}
              className="btn-block w-full justify-center py-4 mt-8 bg-ajicolor-yellow text-base disabled:opacity-40"
            >
              {stockTotal === 0 ? "Sin stock" : "Agregar al carrito"}
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t-2 border-ajicolor-ink py-10 text-center">
        <p className="text-lg font-black">
          AJI<span className="text-ajicolor-magenta">COLOR</span>
        </p>
      </footer>
    </div>
  );
}
