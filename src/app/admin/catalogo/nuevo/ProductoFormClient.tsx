"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TALLES_KIDS } from "@/lib/kids";

const TALLES_ADULTO = ["S", "M", "L", "XL", "2XL"];

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

interface ColorImageData {
  id: string;
  color: string;
  lado: "Frente" | "Espalda";
  url: string;
}

interface ColorData {
  id: string;
  nombre: string;
  hex: string;
  categoria: "Adulto" | "Kids";
}

export default function ProductoFormClient({
  initialData,
  colores,
}: {
  initialData?: {
    id: string;
    nombre: string;
    slug: string;
    descripcion: string;
    disenoUrl: string;
    artista: string;
    temporada: string;
    categoria: "Adulto" | "Kids";
    precio: number | any;
    variants: { id: string; talle: string; color: string; sku: string; stock: number; stockMin: number }[];
    images?: ProductImageData[];
    colorImages?: ColorImageData[];
  };
  colores: ColorData[];
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
  const [categoria, setCategoria] = useState<"Adulto" | "Kids">(initialData?.categoria ?? "Adulto");
  const [precio, setPrecio] = useState(initialData ? Number(initialData.precio) : 0);
  const paletaActiva = useMemo(() => colores.filter((c) => c.categoria === categoria), [colores, categoria]);
  const tallesActivos: string[] = categoria === "Kids" ? [...TALLES_KIDS] : TALLES_ADULTO;
  const [tieneFrenteEspalda, setTieneFrenteEspalda] = useState(false);
  const [colorImages, setColorImages] = useState<ColorImageData[]>(initialData?.colorImages ?? []);
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);
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
  const coloresUsados = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter(Boolean))),
    [variants]
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

  async function handleUploadColorImage(color: string, lado: "Frente" | "Espalda", file: File | null) {
    if (!file || !initialData) return;
    const key = `${color}-${lado}`;
    setUploadingColor(key);
    setError("");
    try {
      const { setProductColorImage } = await import("@/lib/actions/products");
      const formData = new FormData();
      formData.append("file", file);
      const saved = await setProductColorImage(initialData.id, color, lado, formData);
      setColorImages((prev) => [...prev.filter((ci) => !(ci.color === color && ci.lado === lado)), saved]);
      // El server completa disenoUrl solo si estaba vacío (ver
      // setProductColorImage) — reflejarlo acá evita que el campo override
      // de edición muestre un valor viejo/vacío hasta recargar la página.
      if (lado === "Frente" && !disenoUrl) setDisenoUrl(saved.url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir la foto");
    } finally {
      setUploadingColor(null);
    }
  }

  async function handleRemoveColorImage(id: string) {
    try {
      const { removeProductColorImage } = await import("@/lib/actions/products");
      await removeProductColorImage(id);
      setColorImages((prev) => prev.filter((ci) => ci.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar la foto");
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

    // En modo creación no se edita la lista de variantes (se crean después,
    // en modo edición) — la fila vacía inicial del estado no cuenta como
    // variante real y no debe bloquear el guardado.
    if (isEdit) {
      const hasEmptyVariant = variants.some((v) => !v.talle.trim() || !v.color.trim() || !v.sku.trim());
      if (hasEmptyVariant) {
        setError("Todas las variantes deben tener talle, color y SKU");
        return;
      }
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
          categoria,
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
          categoria,
          precio,
          // La fila inicial vacía (placeholder del estado, nunca editable
          // en modo creación) no se envía — las variantes reales se crean
          // después, en modo edición.
          variants: [],
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
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as "Adulto" | "Kids")}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="Adulto">Adulto</option>
                <option value="Kids">Kids</option>
              </select>
              <p className="text-xs text-gray-400 mt-1 dark:text-neutral-500">
                Determina la paleta de colores de las variantes y en qué sección aparece (/ o /kids).
              </p>
            </div>
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">URL del Diseño</label>
                <input
                  type="text"
                  value={disenoUrl}
                  onChange={(e) => setDisenoUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
                <p className="text-xs text-gray-400 mt-1 dark:text-neutral-500">
                  Se completa sola con la primera foto de frente que subas abajo — solo tocar si necesitás forzar otra imagen.
                </p>
              </div>
            )}
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
                    <select
                      value={v.talle}
                      onChange={(e) => updateVariant(i, "talle", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    >
                      <option value="">Seleccionar...</option>
                      {tallesActivos.map((talle) => (
                        <option key={talle} value={talle}>
                          {talle}
                        </option>
                      ))}
                      {v.talle && !tallesActivos.includes(v.talle) && (
                        <option value={v.talle}>{v.talle} (fuera de rango)</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Color</label>
                    <select
                      value={v.color}
                      onChange={(e) => updateVariant(i, "color", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    >
                      <option value="">Seleccionar...</option>
                      {paletaActiva.map((c) => (
                        <option key={c.id} value={c.nombre}>
                          {c.nombre}
                        </option>
                      ))}
                      {v.color && !paletaActiva.some((c) => c.nombre === v.color) && (
                        <option value={v.color}>{v.color} (fuera de paleta)</option>
                      )}
                    </select>
                    {paletaActiva.length === 0 && (
                      <p className="text-[10px] text-ajicolor-magenta mt-1">
                        No hay colores cargados para {categoria} — agrégalos en{" "}
                        <Link href="/admin/colores" className="underline">
                          Colores
                        </Link>
                        .
                      </p>
                    )}
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

        {isEdit && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-1 dark:text-neutral-200">Fotos por color</h2>
            <p className="text-xs text-gray-400 mb-4 dark:text-neutral-500">
              Un color solo aparece como opción de compra en la ficha pública si tiene al menos la foto de frente subida.
            </p>

            <label className="flex items-center gap-2 mb-4 text-sm font-medium dark:text-neutral-200">
              <input
                type="checkbox"
                checked={tieneFrenteEspalda}
                onChange={(e) => setTieneFrenteEspalda(e.target.checked)}
              />
              Este producto tiene estampado de frente y espalda
            </label>

            {coloresUsados.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-neutral-400">
                Agrega al menos una variante con color para poder subir fotos.
              </p>
            ) : (
              <div className="space-y-4">
                {coloresUsados.map((color) => {
                  const frente = colorImages.find((ci) => ci.color === color && ci.lado === "Frente");
                  const espalda = colorImages.find((ci) => ci.color === color && ci.lado === "Espalda");
                  const hex = colores.find((c) => c.nombre === color)?.hex ?? "#ccc";
                  return (
                    <div key={color} className="flex items-center gap-4 border border-gray-200 dark:border-neutral-700 rounded-md p-3">
                      <span
                        className="w-6 h-6 rounded-full border border-gray-300 dark:border-neutral-600 shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <p className="text-sm font-medium w-28 shrink-0 dark:text-neutral-100">{color}</p>

                      <ColorImageSlot
                        label="Frente"
                        image={frente}
                        uploading={uploadingColor === `${color}-Frente`}
                        onUpload={(file) => handleUploadColorImage(color, "Frente", file)}
                        onRemove={() => frente && handleRemoveColorImage(frente.id)}
                      />

                      {tieneFrenteEspalda && (
                        <ColorImageSlot
                          label="Espalda"
                          image={espalda}
                          uploading={uploadingColor === `${color}-Espalda`}
                          onUpload={(file) => handleUploadColorImage(color, "Espalda", file)}
                          onRemove={() => espalda && handleRemoveColorImage(espalda.id)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
        {!isEdit && (
          <p className="text-xs text-gray-400 mb-6 dark:text-neutral-500">
            Las fotos por color se suben después de crear el producto, desde esta misma pantalla en modo edición.
          </p>
        )}

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

function ColorImageSlot({
  label,
  image,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  image: ColorImageData | undefined;
  uploading: boolean;
  onUpload: (file: File | null) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-500 dark:text-neutral-400 mb-1">{label}</p>
      {image ? (
        <div className="relative w-16 h-16 thick-border overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={`${label} ${image.color}`} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center w-16 h-16 thick-border border-dashed text-[10px] text-gray-400 dark:text-neutral-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800">
          {uploading ? "..." : "+ Subir"}
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
