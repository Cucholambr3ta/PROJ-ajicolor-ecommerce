import Link from "next/link";
import Image from "next/image";

interface RelatedProduct {
  id: string;
  slug: string;
  nombre: string;
  disenoUrl: string;
  precio: number;
}

export default function RelatedProducts({ products }: { products: RelatedProduct[] }) {
  return (
    <section className="max-w-5xl mx-auto py-4 px-8 pb-16">
      <h2 className="text-xl font-black border-b-2 border-ajicolor-ink pb-3 mb-6">También te puede gustar</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link key={product.id} href={`/producto/${product.slug}`} className="card overflow-hidden flex flex-col">
            <div className="bg-gray-100 dark:bg-neutral-800 relative overflow-hidden aspect-square">
              <Image
                src={product.disenoUrl}
                alt={product.nombre}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="font-bold text-sm">{product.nombre}</h3>
              <p className="text-ajicolor-magenta font-black text-sm">
                ${product.precio.toLocaleString("es-CL")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
