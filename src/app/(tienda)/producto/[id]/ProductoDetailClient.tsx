"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TALLES_ADULTO, TALLES_KIDS, usaTalles } from "@/lib/talles";
import { resolvePrecioFromRules } from "@/lib/pricing-resolve";

interface Variant {
  id: string;
  talle: string;
  color: string;
  stock: number;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
}

interface ColorImage {
  color: string;
  lado: "Frente" | "Espalda";
  url: string;
}

interface ColorInfo {
  nombre: string;
  hex: string;
}

type TipoProducto = "Polera" | "Poleron" | "Totebag" | "Reloj" | "Papeleria";

interface Product {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string;
  disenoUrl: string;
  artista: string;
  temporada: string;
  categoria: "Adulto" | "Kids";
  tipo: TipoProducto;
  precio: number | any;
  variants: Variant[];
  images?: ProductImage[];
  colorImages: ColorImage[];
}

interface PriceRuleInfo {
  tipo: TipoProducto;
  talleDesde: string;
  talleHasta: string;
  precio: number;
  productId: string | null;
}

interface TallaGuiaInfo {
  tipo: TipoProducto;
  categoria: "Adulto" | "Kids";
  imageUrl: string;
}

/** Reloj y Papelería no tienen color relevante para la compra — la ficha
 * no muestra el selector de color, solo la galería general de fotos. */
function usaGaleria(tipo: TipoProducto): boolean {
  return tipo === "Reloj" || tipo === "Papeleria";
}

const ESPECIFICACION_POR_TIPO: Record<TipoProducto, string> = {
  Polera: "100% Algodón Heavy Weight · 195 Grs",
  Poleron: "100% Algodón Heavy Weight · Frisado interior",
  Totebag: "Tela resistente · Asas reforzadas",
  Reloj: "Correa ajustable · Resistente al agua",
  Papeleria: "Papel couché · Impresión de alta calidad",
};

const LABEL_TIPO: Record<TipoProducto, string> = {
  Polera: "Polera",
  Poleron: "Polerón",
  Totebag: "Totebag",
  Reloj: "Reloj",
  Papeleria: "Papelería",
};

const CANTIDAD_MAXIMA = 10;

const MEDIDAS_POR_TALLE_ADULTO: Record<string, { ancho: number; largo: number }> = {
  S: { ancho: 48, largo: 68 },
  M: { ancho: 51, largo: 70 },
  L: { ancho: 54, largo: 72 },
  XL: { ancho: 57, largo: 74 },
  "2XL": { ancho: 60, largo: 76 },
};

// Medidas Kids provisionales (por edad) — a reemplazar cuando llegue la
// tabla real de medidas de la línea infantil.
const MEDIDAS_POR_TALLE_KIDS: Record<string, { ancho: number; largo: number }> = {
  "2-4": { ancho: 30, largo: 40 },
  "6-8": { ancho: 34, largo: 46 },
  "10-12": { ancho: 38, largo: 52 },
  "14-16": { ancho: 42, largo: 58 },
};

export default function ProductoDetailClient({
  product,
  productPar,
  colores,
  coloresPar,
  priceRules,
  tallaGuias,
}: {
  product: Product;
  /** Versión Adulto↔Kids del mismo diseño (ver kidsVersionId en el
   * schema) — si existe, la ficha muestra un selector "Adulto / Niño"
   * que cambia TODO el bloque de colores/tallas/fotos entre los dos. */
  productPar?: Product | null;
  colores: ColorInfo[];
  coloresPar?: ColorInfo[];
  /** Reglas de precio (tabla general + overrides de drop) aplicables a
   * product/productPar — ver src/lib/pricing.ts. El precio mostrado se
   * resuelve acá mismo (resolvePrecioFromRules) cada vez que cambia el
   * talle elegido, en vez de usar el product.precio fijo del server. */
  priceRules: PriceRuleInfo[];
  /** Imágenes vector de guía de tallas por tipo+categoría (admin, ver
   * /admin/precios) — se filtra por activeProduct.tipo/categoria dentro
   * del componente. */
  tallaGuias: TallaGuiaInfo[];
}) {
  const router = useRouter();

  // Audiencia activa: arranca en la del producto con el que se entró a la
  // página (por link/slug), y el toggle intercambia cuál de los dos
  // productos (product o productPar) maneja el resto del estado de abajo.
  const [audienciaActiva, setAudienciaActiva] = useState<"Adulto" | "Kids">(product.categoria);
  const activeProduct = audienciaActiva === product.categoria ? product : (productPar ?? product);
  const activeColores = audienciaActiva === product.categoria ? colores : (coloresPar ?? colores);

  const esKids = activeProduct.categoria === "Kids";
  const productoUsaTalles = usaTalles(activeProduct.tipo);
  const productoUsaGaleria = usaGaleria(activeProduct.tipo);
  const TALLES_ORDEN = esKids ? TALLES_KIDS : TALLES_ADULTO;
  const MEDIDAS_POR_TALLE = esKids ? MEDIDAS_POR_TALLE_KIDS : MEDIDAS_POR_TALLE_ADULTO;
  const COLOR_HEX: Record<string, string> = useMemo(
    () => Object.fromEntries(activeColores.map((c) => [c.nombre, c.hex])),
    [activeColores]
  );

  const gallery =
    activeProduct.images && activeProduct.images.length > 0
      ? activeProduct.images
      : [{ id: "main", url: activeProduct.disenoUrl, alt: activeProduct.nombre }];
  const [activeImage, setActiveImage] = useState(0);

  // Pseudo-3D: la foto inclina levemente siguiendo el mouse (parallax +
  // sheen), simulando profundidad sin un modelo 3D real — no tenemos más
  // que las fotos planas de frente/espalda, así que esto es lo que da
  // sensación de "objeto" en vez de imagen plana, sin agregar ni un asset
  // nuevo. useSpring suaviza el movimiento (si no, el tilt salta duro con
  // cada pixel del mouse). rotateX/Y van en grados chicos (±8) para que se
  // sienta sutil, no como un efecto de card de videojuego.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useTransform(tiltY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(tiltX, [-0.5, 0.5], [-8, 8]), springConfig);
  const sheenX = useSpring(useTransform(tiltX, [-0.5, 0.5], [0, 100]), springConfig);
  const sheenY = useSpring(useTransform(tiltY, [-0.5, 0.5], [0, 100]), springConfig);
  const sheenBackground = useTransform(
    [sheenX, sheenY],
    ([x, y]: number[]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.35), transparent 55%)`
  );

  // Mientras el mouse está sobre la foto, el ciclo automático Frente/Espalda
  // se pausa (pedido explícito) — así se puede mirar bien un lado sin que
  // cambie solo a mitad de mirarlo. Reusa el mismo área que el tilt
  // (handleTiltMove/handleTiltLeave), no hace falta un listener aparte.
  const [pausado, setPausado] = useState(false);

  function handleTiltMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!pausado) setPausado(true);
    const rect = e.currentTarget.getBoundingClientRect();
    tiltX.set((e.clientX - rect.left) / rect.width - 0.5);
    tiltY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleTiltLeave() {
    setPausado(false);
    tiltX.set(0);
    tiltY.set(0);
  }

  // Foto por color real: viene de ProductColorImage (subida desde el panel
  // admin a Supabase Storage) — ya llega filtrada y lista desde el server,
  // sin necesidad de probar archivos estáticos en el cliente. Cada color
  // puede tener frente y/o espalda.
  const fotoPorColor = useMemo(() => {
    const mapa: Record<string, { frente?: string; espalda?: string }> = {};
    for (const ci of activeProduct.colorImages) {
      const entry = mapa[ci.color] ?? {};
      if (ci.lado === "Frente") entry.frente = ci.url;
      else entry.espalda = ci.url;
      mapa[ci.color] = entry;
    }
    return mapa;
  }, [activeProduct.colorImages]);

  const coloresConFoto = useMemo(
    () => Object.keys(fotoPorColor).filter((c) => fotoPorColor[c].frente),
    [fotoPorColor]
  );
  const tieneSelectorColor = coloresConFoto.length > 0;

  // Frente/Espalda ya no se elige a mano — si el color en preview tiene
  // ambas fotos, se van intercambiando solas cada 2.5s (pedido explícito:
  // sin botón, automático). Con una sola foto, ladoActivo queda fijo en
  // "frente" y no hay nada que animar.
  const [ladoActivo, setLadoActivo] = useState<"frente" | "espalda">("frente");

  // El back-end (page.tsx) ya filtra product.variants para incluir solo
  // colores con foto de frente subida — ningún color "sin foto" llega acá
  // como opción comprable.
  const coloresDisponibles = useMemo(
    () => Array.from(new Set(activeProduct.variants.map((v) => v.color))),
    [activeProduct.variants]
  );
  const [selectedColor, setSelectedColor] = useState(coloresDisponibles[0] ?? "");
  // Preview en vivo al pasar el mouse por un swatch, sin confirmar la
  // selección todavía (eso sigue pasando solo al hacer clic, que también
  // actualiza la talla disponible — el hover no debe tocar la talla).
  const [colorHover, setColorHover] = useState<string | null>(null);
  const colorEnPreview = colorHover ?? selectedColor;

  // El ciclo automático Frente/Espalda solo corre si el color en preview
  // tiene ambas fotos — si solo hay frente (espalda no subida todavía),
  // queda fijo en esa única foto.
  const tieneEspalda = Boolean(fotoPorColor[colorEnPreview]?.espalda);

  useEffect(() => {
    if (!tieneEspalda || pausado) {
      if (!tieneEspalda) setLadoActivo("frente");
      return;
    }
    const id = setInterval(() => setLadoActivo((l) => (l === "frente" ? "espalda" : "frente")), 2500);
    return () => clearInterval(id);
  }, [tieneEspalda, colorEnPreview, pausado]);

  const tallesDelColor = useMemo(
    () => activeProduct.variants.filter((v) => v.color === selectedColor),
    [activeProduct.variants, selectedColor]
  );
  const [selectedTalle, setSelectedTalle] = useState(tallesDelColor[0]?.talle ?? TALLES_ORDEN[0]);

  // Cambiar de audiencia (Adulto/Niño) resetea color y talla seleccionados
  // al primero disponible de la nueva lista — un color de Adulto puede no
  // existir en la paleta Kids y viceversa.
  useEffect(() => {
    const primerColor = coloresDisponibles[0] ?? "";
    setSelectedColor(primerColor);
    const variantesDelColor = activeProduct.variants.filter((v) => v.color === primerColor);
    setSelectedTalle(variantesDelColor[0]?.talle ?? TALLES_ORDEN[0]);
    setActiveImage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audienciaActiva]);

  const selectedVariant = tallesDelColor.find((v) => v.talle === selectedTalle);

  // Precio real del talle elegido — puede ser distinto dentro del mismo
  // producto (ej. 2XL más caro, ver src/lib/pricing.ts). selectedTalle ya
  // vale TALLE_UNICO/"Única" para Totebag/Reloj/Papelería (no usan tallas
  // reales, ver TALLES_ORDEN más arriba), así que esto funciona igual para
  // esos tipos sin casos especiales acá.
  const precioActivo = useMemo(
    () => resolvePrecioFromRules(activeProduct, selectedTalle, priceRules),
    [activeProduct, selectedTalle, priceRules]
  );

  const [cantidad, setCantidad] = useState(1);
  const [showGuia, setShowGuia] = useState(false);
  const guiaImagen = useMemo(
    () => tallaGuias.find((g) => g.tipo === activeProduct.tipo && g.categoria === activeProduct.categoria)?.imageUrl,
    [tallaGuias, activeProduct.tipo, activeProduct.categoria]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [added, setAdded] = useState(false);

  function handleSelectColor(color: string) {
    setSelectedColor(color);
    const variantesDelColor = activeProduct.variants.filter((v) => v.color === color);
    setSelectedTalle(variantesDelColor[0]?.talle ?? TALLES_ORDEN[0]);
  }

  async function handleAddToCart() {
    if (!selectedVariant) return;
    setLoading(true);
    setError("");
    setAdded(false);
    try {
      const { addToCart } = await import("@/lib/actions/cart");
      await addToCart(selectedVariant.id, cantidad);
      setAdded(true);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al agregar al carrito";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-6xl mx-auto py-12 p-8">
      <div className="grid lg:grid-cols-[3fr_2fr] gap-12">
        <div>
          <div className="thick-border pop-shadow bg-white dark:bg-neutral-900 p-3">
            <div className="flex items-center justify-between mb-3 border-b-2 border-ajicolor-ink pb-2">
              <p className="font-black text-sm">Producto</p>
            </div>
            {tieneSelectorColor ? (
              <div
                className="relative w-full aspect-square overflow-hidden"
                style={{ perspective: 1000 }}
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                >
                  {coloresConFoto.map((color) => {
                    const foto = fotoPorColor[color];
                    const src = ladoActivo === "espalda" && foto.espalda ? foto.espalda : foto.frente;
                    const esPreview = color === colorEnPreview;
                    return (
                      <div
                        key={color}
                        className="absolute inset-0 transition-opacity duration-500 ease-out"
                        style={{ opacity: esPreview ? 1 : 0 }}
                      >
                        {/* Frente/Espalda se intercambian solas (ver useEffect de
                            ladoActivo) — un fundido con leve escala/blur en vez
                            de un corte brusco de src o un flip 3D (se probó y
                            se sentía amateur), más parecido a cómo animan las
                            fichas de producto de e-commerce grandes. Solo anima
                            la foto que está realmente visible: las demás (otros
                            colores en opacity:0) no corren la animación para no
                            gastar ciclos de rAF de más. */}
                        <AnimatePresence mode="sync" initial={false}>
                          {esPreview && (
                            <motion.img
                              key={`${color}-${ladoActivo}`}
                              src={src}
                              alt={`${activeProduct.nombre} — ${color} — ${ladoActivo}`}
                              className="absolute inset-0 w-full h-full object-cover"
                              initial={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
                              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                              exit={{ opacity: 0, scale: 0.98, filter: "blur(6px)" }}
                              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
                {/* Brillo que sigue al mouse — refuerza la sensación de
                    superficie 3D además del tilt (pseudo-3D, no hay modelo
                    real: solo tenemos las 2 fotos planas subidas). */}
                <motion.div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay"
                  style={{ background: sheenBackground }}
                />
              </div>
            ) : (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={gallery[activeImage]?.url ?? activeProduct.disenoUrl}
                  alt={gallery[activeImage]?.alt ?? activeProduct.nombre}
                  className="w-full aspect-square object-cover"
                />
              </div>
            )}
            {!tieneSelectorColor && gallery.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {gallery.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 shrink-0 thick-border overflow-hidden ${i === activeImage ? "ring-2 ring-ajicolor-magenta" : ""}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3">
              {!productoUsaGaleria && (
                <span className="block w-full bg-ajicolor-magenta text-white px-4 py-2 text-xs font-black uppercase text-center mb-3">
                  Dale color!
                </span>
              )}
              {!productoUsaGaleria && coloresDisponibles.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-3 justify-center">
                  {coloresDisponibles.map((color) => (
                    <motion.button
                      key={color}
                      onClick={() => handleSelectColor(color)}
                      onMouseEnter={() => fotoPorColor[color]?.frente && setColorHover(color)}
                      onMouseLeave={() => setColorHover(null)}
                      onFocus={() => fotoPorColor[color]?.frente && setColorHover(color)}
                      onBlur={() => setColorHover(null)}
                      title={color}
                      aria-label={color}
                      aria-pressed={color === selectedColor}
                      whileHover={{ scale: 1.35 }}
                      whileTap={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      className={`w-7 h-7 shrink-0 rounded-full border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ajicolor-magenta ${
                        color === selectedColor ? "border-ajicolor-magenta" : "border-gray-300 dark:border-neutral-700"
                      }`}
                      style={{ backgroundColor: COLOR_HEX[color] ?? "#ccc" }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-5xl font-black text-ajicolor-purple dark:text-neutral-100 leading-none mb-1">{activeProduct.artista}</h1>
          <p className="text-2xl text-ajicolor-magenta italic font-medium mb-2">{activeProduct.nombre}</p>
          {activeProduct.descripcion && (
            <p className="text-sm text-gray-500 dark:text-neutral-400 mb-6">{activeProduct.descripcion}</p>
          )}

          <p className="text-4xl font-black text-ajicolor-magenta mb-8">
            ${precioActivo.toLocaleString("es-CL")}
          </p>

          <div className="mb-6">
            {productPar && (
              <div className="flex gap-2 mb-4">
                {(["Adulto", "Kids"] as const).map((aud) => (
                  <button
                    key={aud}
                    onClick={() => setAudienciaActiva(aud)}
                    className={`px-4 py-2 text-xs font-black uppercase tracking-wide thick-border ${
                      audienciaActiva === aud
                        ? "bg-ajicolor-purple text-white dark:bg-ajicolor-ink"
                        : "bg-white dark:bg-neutral-900 text-ajicolor-ink dark:text-neutral-100"
                    }`}
                  >
                    {aud === "Adulto" ? "Adulto" : "Niño"}
                  </button>
                ))}
              </div>
            )}

            {productoUsaTalles && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-widest">Selecciona tu talla</p>
                  <button
                    onClick={() => setShowGuia((v) => !v)}
                    className="text-xs font-bold text-ajicolor-purple dark:text-neutral-100 hover:underline"
                  >
                    Guía de tallas
                  </button>
                </div>
                {/* Al cambiar de audiencia (Adulto/Niño), las tallas se
                    repliegan y las nuevas aparecen una tras otra (pedido
                    explícito) — key={audienciaActiva} en el contenedor hace
                    que AnimatePresence trate el bloque entero como una
                    salida/entrada nueva, y el stagger (delay por índice) da
                    el efecto de "una tras otra" en vez de aparecer todas
                    juntas. */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={audienciaActiva}
                    className="flex gap-2 flex-wrap"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    {TALLES_ORDEN.map((talle, i) => {
                      const variant = tallesDelColor.find((v) => v.talle === talle);
                      if (!variant) return null;
                      return (
                        <motion.button
                          key={talle}
                          onClick={() => setSelectedTalle(talle)}
                          variants={{
                            hidden: { opacity: 0, y: 10, scale: 0.9 },
                            visible: { opacity: 1, y: 0, scale: 1 },
                          }}
                          transition={{ duration: 0.3, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                          className={`w-12 h-12 flex items-center justify-center thick-border font-black text-sm ${
                            talle === selectedTalle
                              ? "bg-ajicolor-purple text-white dark:bg-ajicolor-ink"
                              : "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800"
                          }`}
                        >
                          {talle}
                        </motion.button>
                      );
                    })}
                  </motion.div>
                </AnimatePresence>

              </>
            )}

            {selectedVariant && (
              <p className="text-xs text-gray-400 dark:text-neutral-500 font-medium mt-2">
                {selectedVariant.stock > 0
                  ? `${selectedVariant.stock} pieza${selectedVariant.stock === 1 ? "" : "s"} lista${selectedVariant.stock === 1 ? "" : "s"} — envío inmediato`
                  : "Se produce en 5 a 7 días hábiles tras confirmar el pago"}
              </p>
            )}
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-3">Cantidad</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="w-10 h-10 thick-border bg-white dark:bg-neutral-900 font-black"
              >
                −
              </button>
              <span className="w-10 text-center font-bold text-lg">{cantidad}</span>
              <button
                onClick={() => setCantidad((c) => Math.min(CANTIDAD_MAXIMA, c + 1))}
                className="w-10 h-10 thick-border bg-white dark:bg-neutral-900 font-black"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <p className="bg-ajicolor-purple text-white dark:bg-ajicolor-ink px-3 py-1.5 text-xs font-bold uppercase inline-block mb-0">
              Especificación técnica
            </p>
            <div className="thick-border p-4 text-sm italic text-gray-600 dark:text-neutral-300 font-medium">
              {LABEL_TIPO[activeProduct.tipo]} {activeProduct.artista} {productoUsaTalles ? (esKids ? "Kids" : "Hombre MC") : ""}
              <br />
              {ESPECIFICACION_POR_TIPO[activeProduct.tipo]}
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-ajicolor-magenta mt-4">{error}</p>}
          {added && <p className="text-sm font-semibold text-ajicolor-green mt-4">Agregado al carrito.</p>}

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || loading}
            className="btn-block w-full justify-center py-4 mt-8 bg-ajicolor-yellow text-base disabled:opacity-40"
          >
            {loading ? "Agregando..." : "Agregar al carrito"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showGuia && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGuia(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Guía de tallas"
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 thick-border pop-shadow max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center justify-between mb-4 border-b-2 border-ajicolor-ink pb-2">
                <p className="font-black text-sm uppercase">Guía de tallas</p>
                <button
                  onClick={() => setShowGuia(false)}
                  className="text-xs font-bold text-ajicolor-purple dark:text-neutral-100 hover:underline"
                >
                  Cerrar ✕
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-6 items-center">
                {guiaImagen ? (
                  <div className="bg-gray-50 dark:bg-neutral-800 thick-border p-3 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={guiaImagen} alt="Guía de tallas" className="max-h-80 w-full object-contain" />
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-neutral-800 thick-border p-6 flex items-center justify-center text-xs text-gray-400 dark:text-neutral-500 text-center">
                    Todavía no hay imagen guía cargada para este tipo de prenda.
                  </div>
                )}
                <table className="w-full text-xs border-collapse self-start">
                  <thead>
                    <tr className="border-b-2 border-ajicolor-ink text-left">
                      <th className="py-1">Talla</th>
                      <th className="py-1">Ancho (cm)</th>
                      <th className="py-1">Largo (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TALLES_ORDEN.map((talle) => (
                      <tr key={talle} className="border-b border-gray-200 dark:border-neutral-700">
                        <td className="py-1 font-bold">{talle}</td>
                        <td className="py-1">{MEDIDAS_POR_TALLE[talle].ancho}</td>
                        <td className="py-1">{MEDIDAS_POR_TALLE[talle].largo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
