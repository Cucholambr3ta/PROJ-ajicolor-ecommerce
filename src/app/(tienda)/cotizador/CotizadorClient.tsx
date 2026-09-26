"use client";

import { useMemo, useState, FormEvent } from "react";
import Image from "next/image";

interface Color {
  id: string;
  nombre: string;
  hex: string;
  mockupFrenteUrl: string | null;
}

interface Prenda {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  precioBase: number;
  zonaAnchoCm: number | null;
  zonaAltoCm: number | null;
  tallasDisponibles: string[];
  colores: Color[];
}

const CONSEJOS = [
  {
    titulo: "Sube fotos en buena calidad",
    detalle:
      "Para el mejor resultado, tu imagen debe tener una resolución superior a 1500×1500px. Las fotos tomadas por cualquier celular moderno suelen tener calidad suficiente.",
  },
  {
    titulo: "Evita imágenes oscuras",
    detalle: "O que contengan mucha información en el fondo.",
  },
  {
    titulo: "Usa el botón vista previa",
    detalle: "Así podrás asegurarte de obtener una mejor visualización de cómo quedará tu producto.",
  },
  {
    titulo: "No imprimimos con tinta blanca en prendas de color claro",
    detalle:
      "Si tu prenda es Blanca o Natural, no llevará tinta blanca. Si tu imagen contiene blanco en algún sector, se suplirá con el color de la prenda.",
  },
];

export default function CotizadorClient({ prendas }: { prendas: Prenda[] }) {
  const [prendaId, setPrendaId] = useState(prendas[0]?.id ?? "");
  const prenda = useMemo(() => prendas.find((p) => p.id === prendaId), [prendas, prendaId]);

  const [colorNombre, setColorNombre] = useState(prenda?.colores[0]?.nombre ?? "");
  const color = useMemo(() => prenda?.colores.find((c) => c.nombre === colorNombre), [prenda, colorNombre]);

  const [talla, setTalla] = useState(prenda?.tallasDisponibles[0] ?? "");
  const [cantidad, setCantidad] = useState(1);
  const [nombreContacto, setNombreContacto] = useState("");
  const [emailContacto, setEmailContacto] = useState("");
  const [telefonoContacto, setTelefonoContacto] = useState("");
  const [notas, setNotas] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function handleSelectPrenda(p: Prenda) {
    setPrendaId(p.id);
    setColorNombre(p.colores[0]?.nombre ?? "");
    setTalla(p.tallasDisponibles[0] ?? "");
    setShowPreview(false);
  }

  function handleFileChange(f: File | null) {
    setFile(f);
    setShowPreview(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!prenda || !color) return;
    if (!file) {
      setError("Sube tu diseño antes de enviar la cotización");
      return;
    }

    setError("");
    setSubmitting(true);
    setUploading(true);
    try {
      const { uploadDisenoCotizador, crearCotizacion } = await import("@/lib/actions/cotizador");

      const formData = new FormData();
      formData.append("file", file);
      const uploadResult = await uploadDisenoCotizador(formData);
      setUploading(false);
      if (!uploadResult.ok) {
        setError(uploadResult.error);
        return;
      }

      const result = await crearCotizacion({
        nombreContacto,
        emailContacto,
        telefonoContacto: telefonoContacto || undefined,
        prendaBaseId: prenda.id,
        colorNombre: color.nombre,
        talla: talla || undefined,
        cantidad,
        disenoUrl: uploadResult.data,
        notas: notas || undefined,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setDone(true);
    } catch {
      setError("Error al enviar la cotización. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  }

  if (prendas.length === 0) {
    return (
      <p className="text-center text-gray-400 dark:text-neutral-500 font-medium py-20">
        Todavía no hay prendas disponibles para personalizar. Vuelve pronto.
      </p>
    );
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-ajicolor-green mx-auto mb-6 flex items-center justify-center text-white text-4xl font-black">
          ✓
        </div>
        <h2 className="text-2xl font-black mb-2">¡Listo!</h2>
        <p className="text-gray-500 dark:text-neutral-400">
          Recibimos tu solicitud de cotización. Te contactaremos por email o WhatsApp con el precio final y los
          pasos a seguir.
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      {/* Preview */}
      <div>
        <div className="thick-border pop-shadow bg-white dark:bg-neutral-900 p-4 sticky top-24">
          <p className="text-center font-black text-sm py-2 border-b-2 border-ajicolor-ink mb-3">Vista previa</p>
          <div
            className="relative w-full aspect-square overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: color?.hex ?? "#e5e5e5" }}
          >
            {color?.mockupFrenteUrl ? (
              <Image src={color.mockupFrenteUrl} alt={`${prenda?.nombre} ${color.nombre}`} fill className="object-contain" />
            ) : (
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mix-blend-difference">
                {prenda?.nombre} · {color?.nombre}
              </p>
            )}
            {showPreview && previewUrl && (
              <div
                className="absolute flex items-center justify-center overflow-hidden"
                style={{
                  width: "45%",
                  height: "45%",
                  top: "22%",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="Tu diseño" className="max-w-full max-h-full object-contain" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            disabled={!file}
            className="btn-block w-full justify-center bg-ajicolor-purple text-white py-3 mt-4 disabled:opacity-40"
          >
            {showPreview ? "Ocultar vista previa" : "Ver vista previa"}
          </button>

          {prenda?.zonaAnchoCm && prenda?.zonaAltoCm && (
            <p className="text-xs text-gray-400 dark:text-neutral-500 text-center mt-3">
              Área de impresión máxima: {Number(prenda.zonaAnchoCm)}×{Number(prenda.zonaAltoCm)}cm
            </p>
          )}
        </div>

        <div className="mt-6 bg-ajicolor-yellow/20 border-2 border-ajicolor-yellow thick-border p-5 space-y-3">
          <p className="text-xs font-black uppercase tracking-widest">Antes de subir tu diseño</p>
          {CONSEJOS.map((c) => (
            <div key={c.titulo}>
              <p className="text-sm font-bold">{c.titulo}</p>
              <p className="text-xs text-gray-600 dark:text-neutral-300">{c.detalle}</p>
            </div>
          ))}
          <p className="text-[11px] text-gray-500 dark:text-neutral-400 italic pt-1 border-t border-ajicolor-yellow/50">
            Importante: los colores no serán idénticos a los que ves en tu pantalla — cada dispositivo tiene su
            propia configuración. Las prendas oscuras logran mayor contraste que las claras.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-3">1. Elige la prenda</p>
          <div className="grid grid-cols-2 gap-3">
            {prendas.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPrenda(p)}
                className={`thick-border p-4 text-left transition-colors ${
                  p.id === prendaId
                    ? "bg-ajicolor-ink text-white"
                    : "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800"
                }`}
              >
                <p className="font-black">{p.nombre}</p>
                <p className={`text-xs ${p.id === prendaId ? "text-white/70" : "text-gray-400 dark:text-neutral-500"}`}>
                  desde ${p.precioBase.toLocaleString("es-CL")}
                </p>
              </button>
            ))}
          </div>
        </div>

        {prenda && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3">2. Elige el color</p>
            <div className="flex gap-3 flex-wrap">
              {prenda.colores.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorNombre(c.nombre)}
                  title={c.nombre}
                  className={`w-10 h-10 rounded-full border-2 transition-transform ${
                    c.nombre === colorNombre ? "border-ajicolor-magenta scale-110" : "border-gray-300 dark:border-neutral-700"
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        )}

        {prenda && prenda.tallasDisponibles.length > 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-3">3. Elige la talla</p>
            <div className="flex gap-2 flex-wrap">
              {prenda.tallasDisponibles.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTalla(t)}
                  className={`w-12 h-12 flex items-center justify-center thick-border font-black text-sm ${
                    t === talla ? "bg-ajicolor-ink text-white" : "bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Cantidad</label>
          <input
            type="number"
            min={1}
            max={500}
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-24 border-2 border-ajicolor-ink px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Sube tu diseño</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            className="w-full text-sm"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Nombre</label>
            <input
              required
              value={nombreContacto}
              onChange={(e) => setNombreContacto(e.target.value)}
              className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              required
              value={emailContacto}
              onChange={(e) => setEmailContacto(e.target.value)}
              className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest mb-2">Teléfono (opcional)</label>
            <input
              value={telefonoContacto}
              onChange={(e) => setTelefonoContacto(e.target.value)}
              className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest mb-2">Notas (opcional)</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={3}
            placeholder="Cuéntanos algo más sobre lo que necesitas"
            className="w-full border-2 border-ajicolor-ink px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="btn-block w-full justify-center bg-ajicolor-green text-white py-4 text-base disabled:opacity-50"
        >
          {uploading ? "Subiendo diseño..." : submitting ? "Enviando..." : "Solicitar cotización"}
        </button>
      </form>
    </div>
  );
}
