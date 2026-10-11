/**
 * Cálculo de "contain" (como object-fit: contain) de un diseño dentro de una
 * zona de impresión fija, con una escala adicional (50–100%) que el cliente
 * controla. El resultado son dimensiones finales en las mismas unidades que
 * la zona — el caller decide si son % (2D) o unidades de mundo (3D).
 */

export interface Size {
  ancho: number;
  alto: number;
}

export const ESCALA_MIN = 50;
export const ESCALA_MAX = 100;
export const ESCALA_DEFAULT = 100;

export function clampEscala(escalaPct: number): number {
  return Math.min(ESCALA_MAX, Math.max(ESCALA_MIN, Math.round(escalaPct)));
}

/**
 * Ajusta `diseno` dentro de `zona` manteniendo aspect ratio (contain), y
 * luego aplica `escalaPct` sobre ese resultado — el diseño nunca se sale de
 * la zona porque la escala reduce desde el tamaño ya "contenido" (100% =
 * ocupa el máximo posible dentro de la zona sin recortar ni deformar).
 */
export function fitContain(diseno: Size, zona: Size, escalaPct: number = ESCALA_DEFAULT): Size {
  if (diseno.ancho <= 0 || diseno.alto <= 0 || zona.ancho <= 0 || zona.alto <= 0) {
    return { ancho: 0, alto: 0 };
  }

  const escalaZona = Math.min(zona.ancho / diseno.ancho, zona.alto / diseno.alto);
  const factor = (clampEscala(escalaPct) / 100) * escalaZona;

  return {
    ancho: diseno.ancho * factor,
    alto: diseno.alto * factor,
  };
}

/** Centra `tamano` dentro de `zona`, devolviendo el offset (esquina superior izquierda). */
export function centrarEnZona(tamano: Size, zona: Size): { x: number; y: number } {
  return {
    x: (zona.ancho - tamano.ancho) / 2,
    y: (zona.alto - tamano.alto) / 2,
  };
}
