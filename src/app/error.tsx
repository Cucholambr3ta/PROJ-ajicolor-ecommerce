"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-ajicolor-light flex flex-col items-center justify-center text-center p-8">
      <Logo className="h-10 w-auto mb-8" />
      <h1 className="text-3xl font-black mb-2">Algo salió mal</h1>
      <p className="text-sm text-gray-500 mb-8">Ocurrió un error inesperado. Intenta de nuevo.</p>
      <div className="flex gap-3">
        <button onClick={() => reset()} className="btn-block bg-ajicolor-yellow">
          Reintentar
        </button>
        <Link href="/" className="btn-block bg-white">
          Ir al catálogo
        </Link>
      </div>
    </div>
  );
}
