export type Lado = "Frente" | "Espalda";

export interface ZonaImpresion {
  lado: Lado;
  anchoCm: number;
  altoCm: number;
  // Preview 2D: rect en % del mockup (0–100)
  x2d: number;
  y2d: number;
  w2d: number;
  h2d: number;
  // Preview 3D: posición/rotación/tamaño del Decal, en unidades del modelo
  pos3d: [number, number, number];
  rot3d: [number, number, number];
  size3d: [number, number, number];
}

export interface ColorPrenda {
  id: string;
  nombre: string;
  hex: string;
}

export interface PrendaCotizador {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  precioBase: number;
  tallasDisponibles: string[];
  mockupFrenteUrl: string | null;
  mockupEspaldaUrl: string | null;
  modelo3dUrl: string | null;
  colores: ColorPrenda[];
  zonas: ZonaImpresion[];
}

/** Lados con zona de impresión definida para esta prenda — determina qué botones de lado mostrar (CT-04). */
export function ladosDisponibles(prenda: PrendaCotizador): Lado[] {
  return prenda.zonas.map((z) => z.lado);
}

export function zonaDeLado(prenda: PrendaCotizador, lado: Lado): ZonaImpresion | undefined {
  return prenda.zonas.find((z) => z.lado === lado);
}

/** Modelo 3D disponible y al menos una zona con datos 3D no vacíos. */
export function soporta3D(prenda: PrendaCotizador): boolean {
  return Boolean(prenda.modelo3dUrl) && prenda.zonas.length > 0;
}
