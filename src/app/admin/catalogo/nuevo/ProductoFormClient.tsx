"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface VariantInput {
  id?: string;
  talle: string;
  color: string;
  sku: string;
  stock: number;
  stockMin: number;
}

interface ProductImageData {
  id: string;
  url: string;
  alt: string | null;
}

export default function ProductoFormClient({
  initialData,
}: {
  initialData?: {
    id: string;
    nombre: string;
    slug: string;
    descripcion: string;
    disenoUrl: string;
    artista: string;
    temporada: string;
    precio: number | any;
    variants: { id: string; talle: string; color: string; sku: string; stock: number; stockMin: number }[];
    images?: ProductImageData[];
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!initialData;

  function slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  const [nombre, setNombre] = useState(initialData?.nombre ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugEditadoManualmente, setSlugEditadoManualmente] = useState(isEdit);
  const [descripcion, setDescripcion] = useState(initialData?.descripcion ?? "");
  const [disenoUrl, setDisenoUrl] = useState(initialData?.disenoUrl ?? "");
  const [artista, setArtista] = useState(initialData?.artista ?? "");
  const [temporada, setTemporada] = useState(initialData?.temporada ?? "");
  const [precio, setPrecio] = useState(initialData ? Number(initialData.precio) : 0);
  const [variants, setVariants] = useState<VariantInput[]>(
    initialData?.variants.map((v) => ({
      id: v.id,
      talle: v.talle,
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      stockMin: v.stockMin,
    })) ?? [{ talle: "", color: "", sku: "", stock: 0, stockMin: 5 }]
  );
  const [error, setError] = useState("");
  const [images, setImages] = useState<ProductImageData[]>(initialData?.images ?? []);
  const [uploading, setUploading] = useState(false);

  async function handleUploadImages(files: FileList | null) {
    if (!files || files.length === 0 || !initialData) return;
    setUploading(true);
    setError("");
    try {
      const { addProductImages } = await import("@/lib/actions/products");
      const formData = new FormData();
      for (const file of Array.from(files)) formData.append("files", file);
      const created = await addProductImages(initialData.id, formData);
      setImages((prev) => [...prev, ...created]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir imágenes");
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveImage(imageId: string) {
    try {
      const { removeProductImage } = await import("@/lib/actions/products");
      await removeProductImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar imagen");
    }
  }

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

    if (!nombre.trim() || !slug.trim()) {
      setError("El nombre y el slug son obligatorios");
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
          nombre,
          slug,
          descripcion,
          disenoUrl,
          artista,
          temporada,
          precio,
          variants,
        });
      } else {
        const { createProduct } = await import("@/lib/actions/products");
        await createProduct({
          nombre,
          slug,
          descripcion,
          disenoUrl,
          artista,
          temporada,
          precio,
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
        <Link href="/admin/catalogo" className="text-sm text-gray-500 hover:underline dark:text-neutral-400">
          ← Volver a Catálogo
        </Link>
        <h1 className="text-2xl font-black mt-2">
          {isEdit ? "Editar Producto" : "Nuevo Producto"}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-4 dark:text-neutral-200">Información del Producto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value);
                  if (!slugEditadoManualmente) setSlug(slugify(e.target.value));
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Slug (URL) *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugEditadoManualmente(true);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Artista</label>
              <input
                type="text"
                value={artista}
                onChange={(e) => setArtista(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Temporada</label>
              <input
                type="text"
                value={temporada}
                onChange={(e) => setTemporada(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">URL del Diseño</label>
              <input
                type="text"
                value={disenoUrl}
                onChange={(e) => setDisenoUrl(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Precio</label>
              <input
                type="number"
                min={0}
                value={precio}
                onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Descripción</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>
        </Card>

        {isEdit && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-4 dark:text-neutral-200">Galería de imágenes</h2>
            <div className="flex flex-wrap gap-3 mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative w-24 h-24 thick-border overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-0 right-0 bg-red-500 text-white w-6 h-6 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <label className="inline-block px-4 py-2 rounded-md btn-block bg-white dark:bg-neutral-900 cursor-pointer">
              {uploading ? "Subiendo..." : "+ Subir imágenes"}
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={uploading}
                onChange={(e) => handleUploadImages(e.target.files)}
                className="hidden"
              />
            </label>
          </Card>
        )}

        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-neutral-200">Variantes</h2>
            {isEdit && (
              <button
                type="button"
                onClick={addVariant}
                className="px-3 py-1.5 rounded-md btn-block bg-white dark:bg-neutral-900"
              >
                + Agregar variante
              </button>
            )}
          </div>
          {!isEdit && (
            <p className="text-xs text-gray-400 mb-4 dark:text-neutral-500">Las variantes se crean al guardar el producto.</p>
          )}
          {isEdit && variants.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-neutral-400">No hay variantes.</p>
          ) : isEdit ? (
            <div className="space-y-4">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Talle</label>
                    <input
                      type="text"
                      value={v.talle}
                      onChange={(e) => updateVariant(i, "talle", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Color</label>
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => updateVariant(i, "color", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">SKU</label>
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => updateVariant(i, "sku", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={v.stock}
                      onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Mín.</label>
                      <input
                        type="number"
                        min={0}
                        value={v.stockMin}
                        onChange={(e) => updateVariant(i, "stockMin", parseInt(e.target.value) || 0)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      className="self-end px-2 py-2 rounded-md text-red-500 hover:bg-red-50 text-xs dark:text-red-400 dark:hover:bg-red-950"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        {error && <p className="text-red-500 text-sm mb-4 dark:text-red-400">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link
            href="/admin/catalogo"
            className="px-4 py-2 rounded-md btn-block bg-white dark:bg-neutral-900"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="btn-block bg-ajicolor-magenta text-white disabled:opacity-50"
          >
            {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </form>
    </div>
  );
}
