import Link from "next/link";
import { getProducts } from "@/lib/actions/products";
import CartIcon from "@/components/CartIcon";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export default async function TiendaPage() {
  const products = await getProducts();
  const featured = products[0];
  const rest = products.slice(1);

  return (
    <div className="min-h-screen bg-ajicolor-light">
      <nav className="site-nav">
        <Link href="/">
          <Logo />
        </Link>
        <div className="hidden lg:flex gap-10 font-bold text-sm text-ajicolor-purple">
          <Link href="/conoce-al-aji">Conoce al Ají</Link>
          <Link href="/" className="underline decoration-2 underline-offset-4">
            Catálogo
          </Link>
          <Link href="/contacto">Contacto</Link>
        </div>
        <div className="flex items-center gap-5">
          <Link href="/login" className="text-[10px] font-bold text-gray-300 hover:text-gray-500 uppercase">
            Admin
          </Link>
          <CartIcon />
          <Link href="/login-cliente" className="btn-block bg-ajicolor-yellow">
            Login
          </Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto p-8 pt-10">
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-ajicolor-magenta thick-border p-10 flex flex-col justify-center min-h-[320px]">
            <h1 className="text-5xl font-black text-white leading-tight mb-2">
              PRODUCTO
              <br />
              AJI COLOR
            </h1>
          </div>
          <div className="grid grid-rows-2 gap-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-ajicolor-purple thick-border p-6 flex items-center justify-center">
                <p className="text-white text-xl font-black text-center leading-tight">
                  Le ponemos <span className="text-ajicolor-yellow">color</span>
                </p>
              </div>
              <div className="bg-ajicolor-yellow thick-border p-6 flex items-center justify-center">
                <p className="text-ajicolor-green text-xl font-black text-center leading-tight">
                  Merch para tu proyecto
                </p>
              </div>
            </div>
            <div className="bg-ajicolor-green thick-border p-6 flex items-center justify-center">
              <p className="text-white text-2xl font-black uppercase tracking-wide text-center">Colecciones exclusivas</p>
            </div>
          </div>
        </div>

        {featured && (
          <Link href={`/producto/${featured.id}`} className="block card overflow-hidden mb-16">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={featured.disenoUrl} alt={featured.nombreSlug} className="w-full max-h-72 object-cover" />
          </Link>
        )}

        <div className="flex justify-between items-end mb-8 border-b-2 border-ajicolor-ink pb-4">
          <h2 className="text-3xl font-black">Novedades</h2>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-gray-400 font-medium py-20">No hay productos disponibles todavía.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
            {rest.map((product) => {
              const stockTotal = product.variants.reduce((acc, v) => acc + v.stock, 0);
              const soldOut = stockTotal === 0;

              return (
                <Link key={product.id} href={`/producto/${product.id}`} className="card overflow-hidden flex flex-col">
                  <div className="bg-gray-100 relative overflow-hidden aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.disenoUrl}
                      alt={product.nombreSlug}
                      className={`w-full h-full object-cover ${soldOut ? "grayscale opacity-70" : ""}`}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-black">{product.nombreSlug}</h3>
                    <p className="text-xs font-medium text-gray-400 italic mb-2">{product.temporada}</p>
                    <p className="text-ajicolor-magenta font-black">
                      {soldOut ? "Sin stock" : `$${Number(product.precio).toLocaleString("es-CL")}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
