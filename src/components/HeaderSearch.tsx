"use client";

import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, FormEvent } from "react";

export function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    router.push(`/?q=${encodeURIComponent(q.trim())}`);
    setOpen(false);
    setQ("");
  }

  if (open) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-1">
        <input
          autoFocus
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar..."
          className="w-32 sm:w-48 border-2 border-ajicolor-ink px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ajicolor-magenta"
        />
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Cerrar búsqueda"
          className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md"
        >
          <X className="h-4 w-4" />
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Buscar"
      className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
    >
      <Search className="h-5 w-5" />
    </button>
  );
}
