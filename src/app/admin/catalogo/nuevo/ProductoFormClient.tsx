"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface VariantInput {
  talle: string;
  color: string;
  sku: string;
  stock: number;
  stockMin: number;
}

export default function ProductoFormClient({
  initialData,
}: {
  initialData?: {
    id: string;
    nombreSlug: string;
    descripcion: string;
    disenoUrl: string;
    artista: string;
    temporada: string;
    variants: { id: string; talle: string; color: string; sku: string; stock: number; stockMin: number }[];
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!initialData;

  const [nombreSlug, setNombreSlug] = useState(initialData?.nombreSlug ?? "");
  const [descripcion, setDescripcion] = useState(initialData?.descripcion ?? "");
  const [disenoUrl, setDisenoUrl] = useState(initialData?.disenoUrl ?? "");
  const [artista, setArtista] = useState(initialData?.artista ?? "");
  const [temporada, setTemporada] = useState(initialData?.temporada ?? "");
  const [variants, setVariants] = useState<VariantInput[]>(
    initialData?.variants.map((v) => ({
      talle: v.talle,
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      stockMin: v.stockMin,
    })) ?? [{ talle: "", color: "", sku: "", stock: 0, stockMin: 5 }]
  );
  const [error, setError] = useState("");

  function addVariant() {
    setVariants([...variants, { talle: "", color: "", sku: "", stock: 0, stockMin: 5 }]);
  }

  function removeVariant(index: number) {
    if (variants.length <= 1) return;
    setVariants(variants.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, field: keyof VariantInput, value: string | number) {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombreSlug.trim()) {
      setError("El nombre/slug es obligatorio");
      return;
    }

    const hasEmptyVariant = variants.some((v) => !v.talle.trim() || !v.color.trim() || !v.sku.trim());
    if (hasEmptyVariant) {
      setError("Todas las variantes deben tener talle, color y SKU");
      return;
    }

    try {
      if (isEdit) {
        const { updateProduct } = await import("@/lib/actions/products");
        await updateProduct(initialData.id, {
          nombreSlug,
          descripcion,
          disenoUrl,
          artista,
          temporada,
        });
      } else {
        const { createProduct } = await import("@/lib/actions/products");
        await createProduct({
          nombreSlug,
          descripcion,
          disenoUrl,
          artista,
          temporada,
          variants,
        });
      }
      startTransition(() => router.push("/admin/catalogo"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/catalogo" className="text-sm text-gray-500 hover:underline">
          ← Volver a Catálogo
        </Link>
        <h1 className="text-2xl font-bold mt-2">
          {isEdit ? "Editar Producto" : "Nuevo Producto"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Información del Producto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Slug *</label>
              <input
                type="text"
                value={nombreSlug}
                onChange={(e) => setNombreSlug(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Artista</label>
              <input
                type="text"
                value={artista}
                onChange={(e) => setArtista(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temporada</label>
              <input
                type="text"
                value={temporada}
                onChange={(e) => setTemporada(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL del Diseño</label>
              <input
                type="text"
                value={disenoUrl}
                onChange={(e) => setDisenoUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Variantes</h2>
            {isEdit && (
              <button
                type="button"
                onClick={addVariant}
                className="px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium hover:bg-gray-50"
              >
                + Agregar variante
              </button>
            )}
          </div>
          {!isEdit && (
            <p className="text-xs text-gray-400 mb-4">Las variantes se crean al guardar el producto.</p>
          )}
          {isEdit && variants.length === 0 ? (
            <p className="text-sm text-gray-500">No hay variantes.</p>
          ) : isEdit ? (
            <div className="space-y-4">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Talle</label>
                    <input
                      type="text"
                      value={v.talle}
                      onChange={(e) => updateVariant(i, "talle", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Color</label>
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => updateVariant(i, "color", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">SKU</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => updateVariant(i, "sku", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Mín.</label>
                      <input
                        type="number"
                        min={0}
                        value={v.stockMin}
                        onChange={(e) => updateVariant(i, "stockMin", parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="self-end px-2 py-2 rounded-md text-red-500 hover:bg-red-50 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link
            href="/admin/catalogo"
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 rounded-md bg-ajicolor-magenta text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
