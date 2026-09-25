interface Review {
  id: string;
  calificacion: number;
  comentario: string | null;
  createdAt: Date;
  customer: { nombre: string };
}

export default function ProductReviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  const promedio = reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length;

  return (
    <section className="max-w-5xl mx-auto py-4 px-8 pb-16">
      <div className="flex items-center gap-3 border-b-2 border-ajicolor-ink pb-3 mb-6">
        <h2 className="text-xl font-black">Reseñas</h2>
        <span className="text-ajicolor-magenta font-bold text-sm">
          {"★".repeat(Math.round(promedio))}
          {"☆".repeat(5 - Math.round(promedio))} ({reviews.length})
        </span>
      </div>
      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-sm">{r.customer.nombre}</span>
              <span className="text-ajicolor-magenta text-sm">
                {"★".repeat(r.calificacion)}
                {"☆".repeat(5 - r.calificacion)}
              </span>
            </div>
            {r.comentario && <p className="text-sm text-gray-600 dark:text-neutral-300">{r.comentario}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
