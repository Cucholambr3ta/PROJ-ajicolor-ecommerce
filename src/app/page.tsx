import Link from "next/link";
import { getProducts } from "@/lib/actions/products";

export const dynamic = "force-dynamic";

export default async function TiendaPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-ajicolor-paper">
      <nav className="mockup-nav">
        <Link href="/" className="text-4xl font-black italic toon-script text-ajicolor-magenta tracking-tighter">
          Ajicolor
        </Link>
        <div className="hidden lg:flex space-x-12 font-black uppercase text-sm tracking-widest text-ajicolor-purple">
          <Link href="/" className="text-ajicolor-magenta underline decoration-4 underline-offset-8">
            The Music Drop
          </Link>
          <span className="opacity-40">New Sounds</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link href="/login" className="text-[8px] font-black opacity-20 hover:opacity-100 uppercase">
            Admin Access
          </Link>
          <button className="bg-ajicolor-yellow px-8 py-3 thick-border font-black uppercase text-sm wobble-hover">
            Cart (0)
          </button>
        </div>
      </nav>

      <header className="p-8 md:p-20 grid lg:grid-cols-2 gap-12 bg-ajicolor-purple text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center">
          <h1 className="text-7xl md:text-[8rem] font-black leading-none mb-6 tracking-tighter">
            ELECTRIC
            <br />
            <span className="text-ajicolor-yellow toon-script italic normal-case">Melody</span>
          </h1>
          <p className="text-2xl font-light opacity-80 mb-12 max-w-lg">
            Viste el ritmo. Nuestra colección Fusion Pop-Toon combina la energía de los 30s con el diseño moderno.
          </p>
        </div>
        <div className="relative z-10 flex items-center justify-center">
          {products[0] && (
            <div className="bg-white p-4 thick-border rotate-3 shadow-[20px_20px_0px_var(--magenta)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={products[0].disenoUrl} alt={products[0].nombreSlug} className="w-full h-auto max-w-md" />
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-24 p-8">
        <div className="flex justify-between items-end mb-20 border-b-4 border-ajicolor-ink pb-8">
          <h2 className="text-6xl font-black italic uppercase">The Rack</h2>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-2xl font-bold opacity-40 py-20">No hay productos disponibles todavía.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
            {products.map((product) => {
              const stockTotal = product.variants.reduce((acc, v) => acc + v.stock, 0);
              const soldOut = stockTotal === 0;

              return (
                <Link
                  key={product.id}
                  href={`/producto/${product.id}`}
                  className={`card p-4 flex flex-col ${soldOut ? "opacity-60" : ""}`}
                >
                  <div className="bg-gray-100 border-2 border-ajicolor-ink mb-6 relative group overflow-hidden aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.disenoUrl}
                      alt={product.nombreSlug}
                      className={`w-full h-full object-cover transition duration-700 ${soldOut ? "grayscale" : "group-hover:scale-110"}`}
                    />
                    {soldOut && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-3xl font-black uppercase italic rotate-[-15deg] border-4 border-white p-3">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-3xl font-black uppercase mb-2">{product.nombreSlug}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-4">{product.temporada}</p>
                  {!soldOut && (
                    <button className="w-full py-4 bg-white thick-border font-black uppercase text-sm hover:bg-ajicolor-yellow transition">
                      Ver Detalle
                    </button>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <footer className="p-20 bg-ajicolor-ink text-white text-center border-t-8 border-ajicolor-ink">
        <div className="toon-script text-6xl text-ajicolor-magenta mb-8">Ajicolor</div>
        <p className="text-sm opacity-30 font-bold uppercase tracking-[0.5em]">Made for the Rhythm of the Future // 2026</p>
      </footer>
    </div>
  );
}
