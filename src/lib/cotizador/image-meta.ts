"use client";

/** Lee ancho/alto reales de un File de imagen en el navegador, sin subirlo. */
export function readImageDimensions(file: File): Promise<{ ancho: number; alto: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ ancho: img.naturalWidth, alto: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

/** px/cm de un diseño dentro de su zona — usado para el aviso de resolución baja (CT-09). */
export function pxPorCm(disenoPx: number, zonaCm: number): number {
  if (zonaCm <= 0) return 0;
  return disenoPx / zonaCm;
}

/** Umbral mínimo recomendado para impresión de calidad aceptable. */
export const PX_POR_CM_MINIMO = 30; // ≈ 76 DPI equivalente sobre el área real
