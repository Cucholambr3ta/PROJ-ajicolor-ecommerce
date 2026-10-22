"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { TALLES_ADULTO, TALLES_KIDS, TALLE_UNICO, usaTalles } from "@/lib/talles";

type TipoProducto = "Polera" | "Poleron" | "Totebag" | "Reloj" | "Papeleria";

const TIPOS_PRODUCTO: { value: TipoProducto; label: string }[] = [
  { value: "Polera", label: "Polera" },
  { value: "Poleron", label: "Polerón" },
  { value: "Totebag", label: "Totebag" },
  { value: "Reloj", label: "Reloj" },
  { value: "Papeleria", label: "Papelería" },
];

/** Reloj y Papelería no tienen color relevante para la compra — en vez del
 * bloque de colores, se sube una galería libre de fotos (varios ángulos)
 * y se crea una única variante automática color="Único"/talle="Única". */
function usaGaleria(tipo: TipoProducto): boolean {
  return tipo === "Reloj" || tipo === "Papeleria";
}

const COLOR_UNICO = "Único";

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

/** Un color del producto cubre automáticamente todas las tallas activas de
 * la categoría (S/M/L/XL/2XL, o las de Kids) — no se eligen a mano, solo se
 * ajusta el stock de cada una. El SKU lo genera el servidor al guardar.
 * idPorTalle guarda el id de la variante ya existente (modo edición) para
 * que al guardar se actualice en vez de borrar y recrear — una variante
 * recreada pierde su SKU y su id, rompiendo referencias de carrito/pedidos
 * que ya apuntaban a ese id. */
interface ColorBloque {
  color: string;
  stockPorTalle: Record<string, number>;
  stockMinPorTalle: Record<string, number>;
  idPorTalle: Record<string, string>;
}

/** Clave única por color+lado, usada tanto para las fotos ya subidas
 * (modo edición) como para los archivos todavía en memoria (modo creación,
 * antes de que exista un productId al que subirlos). */
function claveFoto(color: string, lado: "Frente" | "Espalda") {
  return `${color}__${lado}`;
}

interface ProductoSimpleData {
  id: string;
  nombre: string;
  artista: string;
}

export default function ProductoFormClient({
  initialData,
  colores,
  kidsDisponibles = [],
  preciosDelProducto = [],
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
    tipo: TipoProducto;
    precio: number | any;
    kidsVersionId?: string | null;
    variants: { id: string; talle: string; color: string; sku: string; stock: number; stockMin: number }[];
    images?: ProductImageData[];
    colorImages?: ColorImageData[];
  };
  colores: ColorData[];
  /** Productos Kids todavía sin vincular a un Adulto (más el que ya está
   * vinculado a este, en modo edición) — para el selector "Versión Kids". */
  kidsDisponibles?: ProductoSimpleData[];
  /** Reglas de precio con productId = este producto (override de drop) —
   * solo existen en modo edición, un producto nuevo todavía no tiene id al
   * que asociarlas. Ver src/lib/pricing.ts. */
  preciosDelProducto?: { id: string; talleDesde: string; talleHasta: string; precio: number }[];
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
  const [tipo, setTipo] = useState<TipoProducto>(initialData?.tipo ?? "Polera");
  const [precio, setPrecio] = useState(initialData ? Number(initialData.precio) : 0);
  const [kidsVersionId, setKidsVersionId] = useState(initialData?.kidsVersionId ?? "");
  const paletaActiva = useMemo(() => colores.filter((c) => c.categoria === categoria), [colores, categoria]);
  const productoUsaTalles = usaTalles(tipo);
  const productoUsaGaleria = usaGaleria(tipo);
  const tallesActivos: string[] = !productoUsaTalles
    ? [TALLE_UNICO]
    : categoria === "Kids"
      ? [...TALLES_KIDS]
      : [...TALLES_ADULTO];
  const [tieneFrenteEspalda, setTieneFrenteEspalda] = useState(false);

  // Fotos ya subidas (modo edición, llegan del server) — se suben una por
  // una al elegir el archivo.
  const [colorImages, setColorImages] = useState<ColorImageData[]>(initialData?.colorImages ?? []);
  const [uploadingColor, setUploadingColor] = useState<string | null>(null);

  // Fotos en memoria (modo creación, sin productId todavía) — se suben
  // todas juntas recién al enviar el formulario. previewUrls son
  // object URLs locales, solo para mostrar la miniatura antes de subir.
  const [fotosPendientes, setFotosPendientes] = useState<Map<string, File>>(new Map());
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());

  // Agrupa las variantes existentes por color para armar los bloques
  // iniciales (modo edición) — en creación arranca vacío, se van
  // agregando colores con el botón. Las tallas no presentes en los datos
  // existentes quedan en 0 (se completan igual, cubriendo todas las tallas
  // activas de la categoría).
  const [bloques, setBloques] = useState<ColorBloque[]>(() => {
    if (!initialData) return [];
    const porColor = new Map<
      string,
      { stock: Record<string, number>; stockMin: Record<string, number>; ids: Record<string, string> }
    >();
    for (const v of initialData.variants) {
      const entry = porColor.get(v.color) ?? { stock: {}, stockMin: {}, ids: {} };
      entry.stock[v.talle] = v.stock;
      entry.stockMin[v.talle] = v.stockMin;
      entry.ids[v.talle] = v.id;
      porColor.set(v.color, entry);
    }
    return Array.from(porColor.entries()).map(([color, { stock, stockMin, ids }]) => ({
      color,
      stockPorTalle: stock,
      stockMinPorTalle: stockMin,
      idPorTalle: ids,
    }));
  });

  const [error, setError] = useState("");
  const [images, setImages] = useState<ProductImageData[]>(initialData?.images ?? []);
  const [uploading, setUploading] = useState(false);

  // Precio especial de este producto (override de drop) — solo tiene
  // sentido en modo edición, ver preciosDelProducto. Mismo formato
  // desde/hasta que la tabla global de /admin/precios, pero con
  // productId fijo a este producto.
  const [preciosProducto, setPreciosProducto] = useState(preciosDelProducto);
  const opcionesTallePrecio = !productoUsaTalles ? [TALLE_UNICO] : categoria === "Kids" ? [...TALLES_KIDS] : [...TALLES_ADULTO];
  const [precioTalleDesde, setPrecioTalleDesde] = useState(opcionesTallePrecio[0]);
  const [precioTalleHasta, setPrecioTalleHasta] = useState(opcionesTallePrecio[0]);
  const [precioEspecial, setPrecioEspecial] = useState(0);
  const [guardandoPrecio, setGuardandoPrecio] = useState(false);

  async function handleAgregarPrecioEspecial() {
    if (!isEdit) return;
    setGuardandoPrecio(true);
    setError("");
    try {
      const { createPriceRule } = await import("@/lib/pricing");
      const creada = await createPriceRule({
        tipo,
        talleDesde: precioTalleDesde,
        talleHasta: precioTalleHasta,
        precio: precioEspecial,
        productId: initialData!.id,
      });
      setPreciosProducto((prev) => [...prev, { id: creada.id, talleDesde: creada.talleDesde, talleHasta: creada.talleHasta, precio: Number(creada.precio) }]);
      setPrecioEspecial(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar el precio especial");
    } finally {
      setGuardandoPrecio(false);
    }
  }

  async function handleQuitarPrecioEspecial(id: string) {
    try {
      const { deletePriceRule } = await import("@/lib/pricing");
      await deletePriceRule(id);
      setPreciosProducto((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al quitar el precio especial");
    }
  }

  // Galería en memoria (modo creación, sin productId todavía) — mismo
  // patrón que fotosPendientes/previewUrls para color, pero para Reloj y
  // Papelería (sin color relevante, varios ángulos libres).
  const [galeriaPendiente, setGaleriaPendiente] = useState<File[]>([]);
  const [previewsGaleria, setPreviewsGaleria] = useState<string[]>([]);

  async function handleUploadImages(files: FileList | null) {
    if (!files || files.length === 0) return;

    if (!isEdit) {
      const nuevos = Array.from(files);
      setGaleriaPendiente((prev) => [...prev, ...nuevos]);
      setPreviewsGaleria((prev) => [...prev, ...nuevos.map((f) => URL.createObjectURL(f))]);
      return;
    }

    setUploading(true);
    setError("");
    try {
      const { addProductImages } = await import("@/lib/actions/products");
      const formData = new FormData();
      for (const file of Array.from(files)) formData.append("files", file);
      const created = await addProductImages(initialData!.id, formData);
      setImages((prev) => [...prev, ...created]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir imágenes");
    } finally {
      setUploading(false);
    }
  }

  function handleRemovePendingGaleria(index: number) {
    setGaleriaPendiente((prev) => prev.filter((_, i) => i !== index));
    setPreviewsGaleria((prev) => prev.filter((_, i) => i !== index));
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
    if (!file) return;
    const key = claveFoto(color, lado);

    if (!isEdit) {
      // Modo creación: el archivo queda en memoria, no se sube todavía —
      // se sube junto con el producto al enviar el formulario.
      setFotosPendientes((prev) => new Map(prev).set(key, file));
      setPreviewUrls((prev) => new Map(prev).set(key, URL.createObjectURL(file)));
      return;
    }

    setUploadingColor(key);
    setError("");
    try {
      const { setProductColorImage } = await import("@/lib/actions/products");
      const formData = new FormData();
      formData.append("file", file);
      const saved = await setProductColorImage(initialData!.id, color, lado, formData);
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

  function handleRemovePendingFoto(color: string, lado: "Frente" | "Espalda") {
    const key = claveFoto(color, lado);
    setFotosPendientes((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
    setPreviewUrls((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
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

  const coloresUsadosEnBloques = useMemo(() => new Set(bloques.map((b) => b.color)), [bloques]);
  const coloresDisponiblesParaAgregar = useMemo(
    () => paletaActiva.filter((c) => !coloresUsadosEnBloques.has(c.nombre)),
    [paletaActiva, coloresUsadosEnBloques]
  );

  function addBloque() {
    const siguienteColor = coloresDisponiblesParaAgregar[0]?.nombre ?? "";
    if (!siguienteColor) return;
    const stockPorTalle = Object.fromEntries(tallesActivos.map((t) => [t, 0]));
    const stockMinPorTalle = Object.fromEntries(tallesActivos.map((t) => [t, 5]));
    setBloques((prev) => [...prev, { color: siguienteColor, stockPorTalle, stockMinPorTalle, idPorTalle: {} }]);
  }

  function removeBloque(color: string) {
    setBloques((prev) => prev.filter((b) => b.color !== color));
    // Limpia también fotos pendientes/subidas de ese color.
    handleRemovePendingFoto(color, "Frente");
    handleRemovePendingFoto(color, "Espalda");
    if (isEdit) {
      const frente = colorImages.find((ci) => ci.color === color && ci.lado === "Frente");
      const espalda = colorImages.find((ci) => ci.color === color && ci.lado === "Espalda");
      if (frente) handleRemoveColorImage(frente.id);
      if (espalda) handleRemoveColorImage(espalda.id);
    }
  }

  function updateBloqueColor(index: number, nuevoColor: string) {
    setBloques((prev) => prev.map((b, i) => (i === index ? { ...b, color: nuevoColor } : b)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nombre.trim() || !slug.trim()) {
      setError("El nombre y el slug son obligatorios");
      return;
    }

    if (!productoUsaGaleria && bloques.length === 0) {
      setError("Agrega al menos un color para poder vender este producto");
      return;
    }

    // Reloj/Papelería: sin colores, una sola variante automática. Si ya
    // existía (modo edición), se preserva su id/SKU igual que cualquier
    // otra variante — initialData.variants ya la trae agrupada bajo
    // color="Único" en el useState inicial de bloques.
    const bloquesEfectivos: ColorBloque[] = productoUsaGaleria
      ? bloques.length > 0
        ? bloques
        : [
            {
              color: COLOR_UNICO,
              stockPorTalle: { [TALLE_UNICO]: 0 },
              stockMinPorTalle: { [TALLE_UNICO]: 5 },
              idPorTalle: {},
            },
          ]
      : bloques;

    // El SKU lo genera el server al crear variantes nuevas. Si la variante
    // ya existía (modo edición), se manda su id para que se actualice en
    // vez de borrarse y recrearse con un id/SKU distinto.
    const variantesConDatos = bloquesEfectivos.flatMap((b) =>
      tallesActivos.map((talle) => ({
        id: b.idPorTalle[talle],
        talle,
        color: b.color,
        stock: b.stockPorTalle[talle] ?? 0,
        stockMin: b.stockMinPorTalle[talle] ?? 5,
      }))
    );

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
          tipo,
          precio,
          kidsVersionId: categoria === "Adulto" ? kidsVersionId || null : null,
          variants: variantesConDatos,
        });
      } else {
        const { createProductWithPhotos } = await import("@/lib/actions/products");
        const formData = new FormData();
        formData.append(
          "data",
          JSON.stringify({
            nombre,
            slug,
            descripcion,
            artista,
            temporada,
            categoria,
            tipo,
            precio,
            kidsVersionId: categoria === "Adulto" ? kidsVersionId || null : null,
            variants: variantesConDatos,
          })
        );
        for (const [key, file] of Array.from(fotosPendientes.entries())) {
          formData.append(`foto__${key}`, file);
        }
        galeriaPendiente.forEach((file, i) => formData.append(`galeria__${i}`, file));
        await createProductWithPhotos(formData);
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
                placeholder="ej. Bandas 2026"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
              <p className="text-xs text-gray-400 mt-1 dark:text-neutral-500">
                Etiqueta del drop/colección — se muestra bajo el nombre en la tienda. Opcional.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Tipo de producto</label>
              <select
                value={tipo}
                onChange={(e) => {
                  setTipo(e.target.value as TipoProducto);
                  setBloques([]);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                {TIPOS_PRODUCTO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1 dark:text-neutral-500">
                Qué es físicamente (para catalogar en /categorias). Polera y Polerón usan tallas; el resto, una sola variante por color.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value as "Adulto" | "Kids");
                  setBloques([]);
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value="Adulto">Adulto</option>
                <option value="Kids">Kids</option>
              </select>
              <p className="text-xs text-gray-400 mt-1 dark:text-neutral-500">
                Determina la paleta de colores y en qué sección aparece (/ o /kids). Cambiarla reinicia los colores cargados abajo.
              </p>
            </div>
            {categoria === "Adulto" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-neutral-300">
                  Versión Kids (opcional)
                </label>
                <select
                  value={kidsVersionId}
                  onChange={(e) => setKidsVersionId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <option value="">— Sin vincular —</option>
                  {kidsDisponibles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.artista} — {p.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1 dark:text-neutral-500">
                  Si el mismo diseño ya tiene una versión Kids cargada como producto aparte, vinculala acá — en la
                  ficha pública aparece un selector Adulto/Niño que cambia entre los dos. Solo se listan productos
                  Kids que todavía no están vinculados a otro Adulto.
                </p>
              </div>
            )}
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
                className="no-spinner w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
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

        {(isEdit || productoUsaGaleria) && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-1 dark:text-neutral-200">
              {productoUsaGaleria ? "Galería de fotos" : "Galería de imágenes"}
            </h2>
            {productoUsaGaleria && (
              <p className="text-xs text-gray-400 mb-4 dark:text-neutral-500">
                {tipo === "Reloj" ? "Reloj" : "Papelería"} no usa colores — subí todas las fotos que necesites (distintos
                ángulos del mismo producto).
                {!isEdit && " Se suben junto con el producto al hacer clic en \"Crear producto\"."}
              </p>
            )}
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
              {previewsGaleria.map((url, i) => (
                <div key={`pending-${i}`} className="relative w-24 h-24 thick-border overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 left-0 right-0 bg-ajicolor-yellow text-ajicolor-ink text-[8px] font-bold text-center uppercase">
                    Pendiente
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePendingGaleria(i)}
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

        {!productoUsaGaleria && (
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-1 dark:text-neutral-200">Colores, fotos y tallas</h2>
          <p className="text-xs text-gray-400 mb-4 dark:text-neutral-500">
            Un color solo aparece como opción de compra en la ficha pública si tiene al menos la foto de frente.
            {!isEdit && " Las fotos se suben junto con el producto al hacer clic en \"Crear producto\"."}
          </p>

          <label className="flex items-center gap-2 mb-5 text-sm font-medium dark:text-neutral-200">
            <input
              type="checkbox"
              checked={tieneFrenteEspalda}
              onChange={(e) => setTieneFrenteEspalda(e.target.checked)}
            />
            Este producto tiene estampado de frente y espalda
          </label>

          <div className="space-y-5">
            {bloques.map((bloque, bi) => {
              const frente = colorImages.find((ci) => ci.color === bloque.color && ci.lado === "Frente");
              const espalda = colorImages.find((ci) => ci.color === bloque.color && ci.lado === "Espalda");
              const opcionesColor = [
                ...paletaActiva.filter((c) => c.nombre === bloque.color || !coloresUsadosEnBloques.has(c.nombre)),
              ];
              return (
                <div key={bi} className="border-2 border-gray-200 dark:border-neutral-700 rounded-md p-4">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-48">
                      <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Color</label>
                      <select
                        value={bloque.color}
                        onChange={(e) => updateBloqueColor(bi, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                      >
                        {opcionesColor.map((c) => (
                          <option key={c.id} value={c.nombre}>
                            {c.nombre}
                          </option>
                        ))}
                        {bloque.color && !paletaActiva.some((c) => c.nombre === bloque.color) && (
                          <option value={bloque.color}>{bloque.color} (fuera de paleta)</option>
                        )}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBloque(bloque.color)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-2 py-1 text-xs mt-5"
                    >
                      Quitar color ✕
                    </button>
                  </div>

                  <div className="flex gap-4 mb-4">
                    <ColorImageSlot
                      label="Frente"
                      imageUrl={frente?.url ?? previewUrls.get(claveFoto(bloque.color, "Frente"))}
                      hasPending={fotosPendientes.has(claveFoto(bloque.color, "Frente"))}
                      uploading={uploadingColor === claveFoto(bloque.color, "Frente")}
                      onUpload={(file) => handleUploadColorImage(bloque.color, "Frente", file)}
                      onRemove={() =>
                        isEdit
                          ? frente && handleRemoveColorImage(frente.id)
                          : handleRemovePendingFoto(bloque.color, "Frente")
                      }
                    />
                    {tieneFrenteEspalda && (
                      <ColorImageSlot
                        label="Espalda"
                        imageUrl={espalda?.url ?? previewUrls.get(claveFoto(bloque.color, "Espalda"))}
                        hasPending={fotosPendientes.has(claveFoto(bloque.color, "Espalda"))}
                        uploading={uploadingColor === claveFoto(bloque.color, "Espalda")}
                        onUpload={(file) => handleUploadColorImage(bloque.color, "Espalda", file)}
                        onRemove={() =>
                          isEdit
                            ? espalda && handleRemoveColorImage(espalda.id)
                            : handleRemovePendingFoto(bloque.color, "Espalda")
                        }
                      />
                    )}
                  </div>

                  <p className="text-xs text-gray-400 dark:text-neutral-500">
                    {productoUsaTalles
                      ? `Tallas de ${categoria} (${tallesActivos.join(", ")}) — se crean automáticamente, bajo pedido (sin límite de stock).`
                      : "Este tipo de producto no usa tallas — una sola variante por color, bajo pedido."}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addBloque}
            disabled={coloresDisponiblesParaAgregar.length === 0}
            className="mt-4 px-4 py-2 rounded-md btn-block bg-white dark:bg-neutral-900 disabled:opacity-40"
          >
            + Agregar color
          </button>
          {paletaActiva.length === 0 && (
            <p className="text-xs text-ajicolor-magenta mt-2">
              No hay colores cargados para {categoria} — agrégalos en{" "}
              <Link href="/admin/colores" className="underline">
                Colores
              </Link>
              .
            </p>
          )}
        </Card>
        )}

        {isEdit && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold text-gray-700 mb-1 dark:text-neutral-200">Precio especial (drop)</h2>
            <p className="text-xs text-gray-400 mb-4 dark:text-neutral-500">
              Sin nada acá, este producto cobra según la tabla general de{" "}
              <Link href="/admin/precios" className="underline">
                Precios
              </Link>
              . Agregá un rango solo si este producto puntual (ej. un drop) tiene que cobrar distinto.
            </p>
            {preciosProducto.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {preciosProducto.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-2 border border-gray-200 dark:border-neutral-700 rounded-md px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium dark:text-neutral-100">
                        {p.talleDesde === p.talleHasta ? p.talleDesde : `${p.talleDesde} – ${p.talleHasta}`}
                      </p>
                      <p className="text-xs text-ajicolor-magenta font-bold">${p.precio.toLocaleString("es-CL")}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuitarPrecioEspecial(p.id)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-1.5 py-1 text-xs shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Desde talle</label>
                <select
                  value={precioTalleDesde}
                  onChange={(e) => setPrecioTalleDesde(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  {opcionesTallePrecio.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Hasta talle</label>
                <select
                  value={precioTalleHasta}
                  onChange={(e) => setPrecioTalleHasta(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  {opcionesTallePrecio.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1 dark:text-neutral-400">Precio</label>
                <input
                  type="number"
                  min={0}
                  value={precioEspecial}
                  onChange={(e) => setPrecioEspecial(parseFloat(e.target.value) || 0)}
                  className="no-spinner w-full border border-gray-300 rounded-md px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>
              <button
                type="button"
                onClick={handleAgregarPrecioEspecial}
                disabled={guardandoPrecio}
                className="px-4 py-2 rounded-md btn-block bg-white dark:bg-neutral-900 disabled:opacity-40"
              >
                + Agregar
              </button>
            </div>
          </Card>
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
  imageUrl,
  hasPending,
  uploading,
  onUpload,
  onRemove,
}: {
  label: string;
  imageUrl: string | undefined;
  hasPending: boolean;
  uploading: boolean;
  onUpload: (file: File | null) => void;
  onRemove: () => void;
}) {
  return (
    <div className="shrink-0">
      <p className="text-[10px] text-gray-500 dark:text-neutral-400 mb-1">{label}</p>
      {imageUrl ? (
        <div className="relative w-20 h-20 thick-border overflow-hidden group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
          {hasPending && (
            <span className="absolute bottom-0 left-0 right-0 bg-ajicolor-yellow text-ajicolor-ink text-[8px] font-bold text-center uppercase">
              Pendiente
            </span>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center w-20 h-20 thick-border border-dashed text-[10px] text-gray-400 dark:text-neutral-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800">
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
