import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(targetPage: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") params.set(key, value);
    }
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex justify-center items-center gap-2 py-10">
      <Link
        href={hrefFor(page - 1)}
        aria-disabled={page <= 1}
        className={`px-4 py-2 text-xs font-bold uppercase thick-border ${
          page <= 1 ? "pointer-events-none opacity-30" : "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800"
        }`}
      >
        Anterior
      </Link>
      <span className="text-sm font-bold px-3">
        Página {page} de {totalPages}
      </span>
      <Link
        href={hrefFor(page + 1)}
        aria-disabled={page >= totalPages}
        className={`px-4 py-2 text-xs font-bold uppercase thick-border ${
          page >= totalPages ? "pointer-events-none opacity-30" : "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800"
        }`}
      >
        Siguiente
      </Link>
    </div>
  );
}
