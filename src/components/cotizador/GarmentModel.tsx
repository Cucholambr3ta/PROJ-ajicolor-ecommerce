"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useGLTF, Decal } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { DisenoLocal } from "./CotizadorClient";
import { type Lado, type PrendaCotizador, zonaDeLado } from "./config";
import { fitContain } from "@/lib/cotizador/fit";

/** Carga una textura desde un object URL y la dispone (dispose) al cambiar/desmontar — evita memory leaks. */
function useDecalTexture(objectUrl: string | undefined, maxAnisotropy: number): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const textureRef = useRef<THREE.Texture | null>(null);

  useEffect(() => {
    if (!objectUrl) {
      setTexture(null);
      return;
    }
    const loader = new THREE.TextureLoader();
    let disposed = false;
    loader.load(objectUrl, (tex) => {
      if (disposed) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAnisotropy;
      textureRef.current = tex;
      setTexture(tex);
    });
    return () => {
      disposed = true;
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }
    };
  }, [objectUrl, maxAnisotropy]);

  return texture;
}

function DecalDeLado({
  lado,
  prenda,
  diseno,
}: {
  lado: Lado;
  prenda: PrendaCotizador;
  diseno: DisenoLocal | undefined;
}) {
  const { gl } = useThree();
  const maxAnisotropy = gl.capabilities.getMaxAnisotropy();
  const texture = useDecalTexture(diseno?.objectUrl, maxAnisotropy);
  const zona = zonaDeLado(prenda, lado);

  if (!zona || !diseno || !texture) return null;

  // Espalda: rotación Y en π sobre el valor base de la zona (el seed H0 solo
  // define Frente; esto queda preparado para cuando se pueble PrendaZona.Espalda).
  const rot3d: [number, number, number] =
    lado === "Espalda" ? [zona.rot3d[0], zona.rot3d[1] + Math.PI, zona.rot3d[2]] : zona.rot3d;

  // size3d mantiene aspect ratio del diseño dentro de la zona (fitContain),
  // el tercer componente (profundidad de proyección) no participa del 2D.
  const tamano2D = fitContain(
    { ancho: diseno.anchoPx, alto: diseno.altoPx },
    { ancho: zona.size3d[0], alto: zona.size3d[1] },
    diseno.escalaPct,
  );
  const size3d: [number, number, number] = [tamano2D.ancho, tamano2D.alto, zona.size3d[2]];

  return <Decal position={zona.pos3d} rotation={rot3d} scale={size3d} map={texture} />;
}

/** useGLTF + color del material clonado (no mutar el material cacheado por drei) + Decals por lado. */
export default function GarmentModel({
  modelo3dUrl,
  colorHex,
  prenda,
  lados,
}: {
  modelo3dUrl: string;
  colorHex: string;
  prenda: PrendaCotizador;
  lados: Partial<Record<Lado, DisenoLocal>>;
}) {
  const { scene, materials } = useGLTF(modelo3dUrl);

  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Mesh "body" dentro de la escena clonada — el Decal de drei necesita ser
  // hijo de un <mesh> real (no de un Group/Object3D genérico) para proyectar
  // sobre su geometría. El GLB provisional tiene un único nodo raíz = mesh.
  const bodyMesh = useMemo<THREE.Mesh | null>(() => {
    const encontrados: THREE.Mesh[] = [];
    clonedScene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) encontrados.push(obj as THREE.Mesh);
    });
    return encontrados[0] ?? null;
  }, [clonedScene]);

  const clonedMaterial = useMemo(() => {
    const original = Object.values(materials)[0] as THREE.MeshStandardMaterial | undefined;
    const mat = original ? (original.clone() as THREE.MeshStandardMaterial) : new THREE.MeshStandardMaterial();
    mat.roughness = 0.9;
    return mat;
  }, [materials]);

  useEffect(() => {
    clonedMaterial.color = new THREE.Color(colorHex);
    clonedMaterial.needsUpdate = true;
  }, [clonedMaterial, colorHex]);

  useEffect(() => {
    if (bodyMesh) bodyMesh.material = clonedMaterial;
  }, [bodyMesh, clonedMaterial]);

  if (!bodyMesh) return <primitive object={clonedScene} />;

  return (
    <primitive object={bodyMesh}>
      {(["Frente", "Espalda"] as Lado[]).map((lado) => (
        <DecalDeLado key={lado} lado={lado} prenda={prenda} diseno={lados[lado]} />
      ))}
    </primitive>
  );
}
