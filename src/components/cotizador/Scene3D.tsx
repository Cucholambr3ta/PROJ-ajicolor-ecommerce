"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import GarmentModel from "./GarmentModel";
import type { DisenoLocal } from "./CotizadorClient";
import type { Lado, PrendaCotizador } from "./config";

const DISTANCIA_MIN = 1.5;
const DISTANCIA_MAX = 4;

function CameraRig({ ladoActivo }: { ladoActivo: Lado }) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const prefersReducedMotion = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const azimutObjetivo = ladoActivo === "Frente" ? 0 : Math.PI;

    if (prefersReducedMotion.current) {
      controls.setAzimuthalAngle(azimutObjetivo);
      controls.update();
      return;
    }

    let raf: number;
    const inicio = controls.getAzimuthalAngle();
    // Camino más corto (evita vueltas largas al cruzar ±π).
    let delta = azimutObjetivo - inicio;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;

    const duracionMs = 400;
    const t0 = performance.now();

    function tick() {
      const t = Math.min(1, (performance.now() - t0) / duracionMs);
      const ease = 1 - (1 - t) * (1 - t);
      controls!.setAzimuthalAngle(inicio + delta * ease);
      controls!.update();
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ladoActivo]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom
      minDistance={DISTANCIA_MIN}
      maxDistance={DISTANCIA_MAX}
      enablePan={false}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 1.7}
    />
  );
}

/** Escena 3D: Canvas, luces, modelo con decals, cámara orbital por lado. */
export default function Scene3D({
  prenda,
  colorHex,
  lados,
  ladoActivo,
  onContextLost,
}: {
  prenda: PrendaCotizador;
  colorHex: string;
  lados: Partial<Record<Lado, DisenoLocal>>;
  ladoActivo: Lado;
  onContextLost: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!prenda.modelo3dUrl) return null;

  return (
    <Canvas
      dpr={[1, 2]}
      shadows={false}
      camera={{ position: [0, 0, 2.2], fov: 35 }}
      role="img"
      aria-label={`${prenda.nombre}, vista ${ladoActivo === "Frente" ? "frontal" : "de espalda"}, en 3D`}
      onCreated={({ gl }) => {
        canvasRef.current = gl.domElement;
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 3, 4]} intensity={1.2} />
      <Suspense fallback={null}>
        <Environment preset="studio" />
        <GarmentModel modelo3dUrl={prenda.modelo3dUrl} colorHex={colorHex} prenda={prenda} lados={lados} />
      </Suspense>
      <CameraRig ladoActivo={ladoActivo} />
    </Canvas>
  );
}
