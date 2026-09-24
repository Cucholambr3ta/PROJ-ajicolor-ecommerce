"use client";

import { useState } from "react";

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const exports = [
  { key: "pedidos", label: "Pedidos", filename: "pedidos.csv" },
  { key: "stock", label: "Stock", filename: "stock.csv" },
  { key: "clientes", label: "Clientes", filename: "clientes.csv" },
] as const;

export default function ExportButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleExport(key: (typeof exports)[number]["key"], filename: string) {
    setLoading(key);
    try {
      const { exportPedidosCSV, exportStockCSV, exportClientesCSV } = await import(
        "@/lib/actions/metrics"
      );
      const csv =
        key === "pedidos"
          ? await exportPedidosCSV()
          : key === "stock"
            ? await exportStockCSV()
            : await exportClientesCSV();
      downloadCSV(csv, filename);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-3">
      {exports.map((exp) => (
        <button
          key={exp.key}
          type="button"
          onClick={() => handleExport(exp.key, exp.filename)}
          disabled={loading !== null}
          className="px-4 py-2 rounded-md border border-gray-300 dark:border-neutral-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading === exp.key ? "Exportando..." : `Exportar ${exp.label}`}
        </button>
      ))}
    </div>
  );
}
