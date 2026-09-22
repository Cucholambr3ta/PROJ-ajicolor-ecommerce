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
  const colores = Array.from(new Set(product.variants.map((v) => v.color)));
  const stockTotal = product.variants.reduce((acc, v) => acc + v.stock, 0);

  return (
    <div className="min-h-screen bg-ajicolor-paper">
      <nav className="mockup-nav">
        <Link href="/" className="text-4xl font-black italic toon-script text-ajicolor-magenta tracking-tighter">
          Ajicolor
        </Link>
        <Link href="/" className="font-black text-xs uppercase hover:underline">
          ← Volver a The Rack
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto py-16 p-8">
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="bg-white p-4 thick-border pop-shadow h-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.disenoUrl} alt={product.nombreSlug} className="w-full h-auto" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-ajicolor-ink text-white px-3 py-1 text-[10px] font-black uppercase">
                {product.temporada}
              </span>
              {stockTotal === 0 && (
                <span className="bg-ajicolor-magenta text-white px-3 py-1 text-[10px] font-black uppercase italic">
                  Sold Out
                </span>
              )}
            </div>
            <h1 className="text-6xl font-black uppercase mb-4 leading-none">{product.nombreSlug}</h1>
            <p className="text-sm font-bold uppercase tracking-widest opacity-50 mb-6">Por {product.artista}</p>
            <p className="text-lg font-medium opacity-70 mb-10">{product.descripcion}</p>

            {talles.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-widest mb-3">Talles</p>
                <div className="flex gap-2 flex-wrap">
                  {talles.map((t) => (
                    <span key={t} className="px-4 py-2 border-2 border-ajicolor-ink font-black text-sm uppercase">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {colores.length > 0 && (
              <div className="mb-10">
                <p className="text-xs font-black uppercase tracking-widest mb-3">Colores</p>
                <div className="flex gap-2 flex-wrap">
                  {colores.map((c) => (
                    <span key={c} className="px-4 py-2 border-2 border-ajicolor-ink font-black text-sm uppercase">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t-4 border-ajicolor-ink pt-8">
              <p className="text-sm font-bold uppercase tracking-widest opacity-50 mb-2">Stock disponible</p>
              <p className="text-3xl font-black mb-8">{stockTotal} unidades</p>
              <button
                disabled={stockTotal === 0}
                className="w-full py-5 bg-ajicolor-yellow thick-border font-black uppercase text-xl wobble-hover disabled:opacity-40 disabled:animate-none"
              >
                {stockTotal === 0 ? "Sin stock" : "Agregar al carrito"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-20 bg-ajicolor-ink text-white text-center">
        <div className="toon-script text-6xl text-ajicolor-magenta mb-8">Ajicolor</div>
      </footer>
    </div>
  );
}
