import Link from "next/link";

export default function TiendaPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ajicolor-magenta">Ajicolor</h1>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-ajicolor-magenta transition-colors"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Catálogo</h2>
          <p className="text-gray-500">Descubrí las últimas colecciones de Ajicolor.</p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <CardPlaceholder title="Remera Básica" temporada="Otoño 2026" />
          <CardPlaceholder title="Buzo Oversize" temporada="Otoño 2026" />
          <CardPlaceholder title="Campera Denim" temporada="Otoño 2026" />
          <CardPlaceholder title="Pantalón Cargo" temporada="Otoño 2026" />
          <CardPlaceholder title="Gorra Trucker" temporada="Otoño 2026" />
          <CardPlaceholder title="Remera Estampada" temporada="Otoño 2026" />
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          &copy; 2026 Ajicolor. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}

function CardPlaceholder({ title, temporada }: { title: string; temporada: string }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Sin imagen</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">{temporada}</p>
      </div>
    </div>
  );
}
