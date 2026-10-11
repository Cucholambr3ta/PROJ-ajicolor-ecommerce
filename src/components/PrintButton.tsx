"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity"
    >
      Imprimir / Guardar como PDF
    </button>
  );
}
