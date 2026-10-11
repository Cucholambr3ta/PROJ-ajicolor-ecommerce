"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import PreviewSwitcher from "./PreviewSwitcher";
import SideToggle from "./SideToggle";
import DesignControls from "./DesignControls";
import DebugZonePanel from "./DebugZonePanel";
import { type Lado, type PrendaCotizador, ladosDisponibles, zonaDeLado } from "./config";

/** Un diseño elegido localmente (sin subir) para un lado — spec §7.3. */
export type DisenoLocal = {
  file: File;
  objectUrl: string;
  anchoPx: number;
  altoPx: number;
  escalaPct: number;
};

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
    titulo: "Gira el modelo 3D",
    detalle: "Usa los botones Frente/Espalda o arrastra para ver cómo queda tu diseño desde todos los ángulos.",
  },
  {
    titulo: "No imprimimos con tinta blanca en prendas de color claro",
    detalle:
      "Si tu prenda es Blanca o Natural, no llevará tinta blanca. Si tu imagen contiene blanco en algún sector, se suplirá con el color de la prenda.",
  },
];

export default function CotizadorClient({ prendas }: { prendas: PrendaCotizador[] }) {
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

  // Estado central del cotizador (spec §7.3) — Preview2D y Preview3D leen de
  // aquí exactamente las mismas props, nunca se desincronizan.
  const [lados, setLados] = useState<Partial<Record<Lado, DisenoLocal>>>({});
  const [ladoActivo, setLadoActivo] = useState<Lado>("Frente");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const ladosConZona = useMemo(() => (prenda ? ladosDisponibles(prenda) : []), [prenda]);
  const zonaActiva = prenda ? zonaDeLado(prenda, ladoActivo) : undefined;

  // Si el lado activo deja de tener zona (p.ej. al cambiar de prenda), cae al primero disponible.
  useEffect(() => {
    if (ladosConZona.length > 0 && !ladosConZona.includes(ladoActivo)) {
      setLadoActivo(ladosConZona[0]);
    }
  }, [ladosConZona, ladoActivo]);

  // Libera los object URLs al desmontar o reemplazar un diseño — evita memory leaks.
  useEffect(() => {
    return () => {
      Object.values(lados).forEach((d) => d && URL.revokeObjectURL(d.objectUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelectPrenda(p: PrendaCotizador) {
    setPrendaId(p.id);
    setColorNombre(p.colores[0]?.nombre ?? "");
    setTalla(p.tallasDisponibles[0] ?? "");
    const primerLado = ladosDisponibles(p)[0];
    if (primerLado) setLadoActivo(primerLado);
  }

  function handleDisenoChange(lado: Lado, diseno: DisenoLocal | null) {
    setLados((prev) => {
      const anterior = prev[lado];
      if (anterior) URL.revokeObjectURL(anterior.objectUrl);
      const next = { ...prev };
      if (diseno) next[lado] = diseno;
      else delete next[lado];
      return next;
    });
  }

  function handleEscalaChange(lado: Lado, escalaPct: number) {
    setLados((prev) => {
      const actual = prev[lado];
      if (!actual) return prev;
      return { ...prev, [lado]: { ...actual, escalaPct } };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // H0: sin envío todavía (CT-11 es H1). Este submit queda deshabilitado
    // a propósito — se completa en el próximo hito junto con el upload real.
    e.stopPropagation();
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
          <div className="flex items-center justify-between border-b-2 border-ajicolor-ink pb-2 mb-3">
            <p className="font-black text-sm">Vista previa</p>
            <SideToggle lados={ladosConZona} ladoActivo={ladoActivo} onChange={setLadoActivo} />
          </div>

          {prenda && (
            <PreviewSwitcher prenda={prenda} color={color} lados={lados} ladoActivo={ladoActivo} />
          )}

          {zonaActiva && (
            <p className="text-xs text-gray-400 dark:text-neutral-500 text-center mt-3">
              Área de impresión máxima: {zonaActiva.anchoCm}×{zonaActiva.altoCm}cm · desde $
              {prenda?.precioBase.toLocaleString("es-CL")}
            </p>
          )}

          {prenda && <DebugZonePanel prenda={prenda} ladoActivo={ladoActivo} />}
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
                  aria-pressed={c.nombre === colorNombre}
                  className={`w-10 h-10 rounded-full border-2 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-ajicolor-magenta ${
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
                  aria-pressed={t === talla}
                  className={`w-12 h-12 flex items-center justify-center thick-border font-black text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-ajicolor-magenta ${
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
          <p className="text-xs font-bold uppercase tracking-widest mb-3">4. Elige los lados a estampar</p>
          {ladosConZona.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-neutral-500">
              Esta prenda todavía no tiene zonas de impresión configuradas.
            </p>
          ) : (
            <div className="space-y-4">
              {ladosConZona.map((lado) => (
                <DesignControls
                  key={lado}
                  lado={lado}
                  diseno={lados[lado]}
                  onChange={(d) => handleDisenoChange(lado, d)}
                  onEscalaChange={(pct) => handleEscalaChange(lado, pct)}
                />
              ))}
            </div>
          )}
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
          disabled
          title="El envío de la cotización llega en el próximo hito"
          className="btn-block w-full justify-center bg-ajicolor-green text-white py-4 text-base disabled:opacity-50"
        >
          {submitting ? "Enviando..." : "Solicitar cotización (próximamente)"}
        </button>
      </form>
    </div>
  );
}
