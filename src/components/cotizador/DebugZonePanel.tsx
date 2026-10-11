"use client";

import { useState } from "react";
import { type Lado, type PrendaCotizador, zonaDeLado } from "./config";

/**
 * Panel de calibración manual (CT-12, solo dev). Sliders sobre pos3d/rot3d/
 * size3d del lado activo, con estado local propio (no toca la BD) — el
 * dueño del proyecto copia el JSON resultante y lo pega a mano en el seed
 * cuando calibre con el modelo real. No se renderiza en producción.
 */
export default function DebugZonePanel({
  prenda,
  ladoActivo,
  onPreview,
}: {
  prenda: PrendaCotizador;
  ladoActivo: Lado;
  onPreview?: (zona: { pos3d: [number, number, number]; rot3d: [number, number, number]; size3d: [number, number, number] }) => void;
}) {
  const zonaBase = zonaDeLado(prenda, ladoActivo);
  const [pos3d, setPos3d] = useState<[number, number, number]>(zonaBase?.pos3d ?? [0, 0, 0]);
  const [rot3d, setRot3d] = useState<[number, number, number]>(zonaBase?.rot3d ?? [0, 0, 0]);
  const [size3d, setSize3d] = useState<[number, number, number]>(zonaBase?.size3d ?? [0.5, 0.5, 0.1]);
  const [copiado, setCopiado] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;
  if (!zonaBase) return null;

  function actualizar(
    campo: "pos3d" | "rot3d" | "size3d",
    idx: number,
    valor: number,
    setter: (v: [number, number, number]) => void,
    actual: [number, number, number],
  ) {
    const next = [...actual] as [number, number, number];
    next[idx] = valor;
    setter(next);
    onPreview?.({
      pos3d: campo === "pos3d" ? next : pos3d,
      rot3d: campo === "rot3d" ? next : rot3d,
      size3d: campo === "size3d" ? next : size3d,
    });
  }

  function copiarJSON() {
    const json = JSON.stringify({ pos3d, rot3d, size3d }, null, 2);
    // eslint-disable-next-line no-console
    console.log(`[DebugZonePanel] PrendaZona.${ladoActivo} calibrada:\n${json}`);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json).then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 1500);
      });
    }
  }

  const campos: Array<{ label: string; key: "pos3d" | "rot3d" | "size3d"; value: [number, number, number]; setter: (v: [number, number, number]) => void; min: number; max: number; step: number }> = [
    { label: "Posición", key: "pos3d", value: pos3d, setter: setPos3d, min: -1, max: 1, step: 0.005 },
    { label: "Rotación", key: "rot3d", value: rot3d, setter: setRot3d, min: -Math.PI, max: Math.PI, step: 0.01 },
    { label: "Tamaño", key: "size3d", value: size3d, setter: setSize3d, min: 0, max: 1, step: 0.005 },
  ];

  return (
    <div className="mt-4 border-2 border-dashed border-gray-400 p-4 space-y-3 text-xs">
      <p className="font-black uppercase tracking-widest">Debug zona 3D ({ladoActivo}) — solo dev</p>
      {campos.map(({ label, key, value, setter, min, max, step }) => (
        <div key={key}>
          <p className="font-bold mb-1">{label}</p>
          <div className="grid grid-cols-3 gap-2">
            {(["x", "y", "z"] as const).map((eje, idx) => (
              <label key={eje} className="flex flex-col gap-1">
                <span className="font-mono">{eje}: {value[idx].toFixed(3)}</span>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={value[idx]}
                  onChange={(e) => actualizar(key, idx, parseFloat(e.target.value), setter, value)}
                />
              </label>
            ))}
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={copiarJSON}
        className="bg-ajicolor-ink text-white px-3 py-1.5 font-black uppercase tracking-widest"
      >
        {copiado ? "Copiado!" : "Copiar JSON"}
      </button>
    </div>
  );
}
