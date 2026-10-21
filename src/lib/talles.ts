/** Talles por categoría, en orden — el ORDEN importa: resolvePrecio
 * (src/lib/pricing.ts) resuelve un rango "desde-hasta" por posición acá
 * adentro, no alfabéticamente, para que "S a XL" incluya M y L. Antes vivían
 * duplicados en ProductoFormClient.tsx y ProductoDetailClient.tsx. */
export const TALLES_ADULTO = ["S", "M", "L", "XL", "2XL"] as const;
export const TALLES_KIDS = ["2-4", "6-8", "10-12", "14-16"] as const;

export type TalleAdulto = (typeof TALLES_ADULTO)[number];
export type TalleKids = (typeof TALLES_KIDS)[number];

/** Talle fijo para tipos de producto sin talles reales (Totebag, Reloj,
 * Papelería) — una sola variante por color. Mismo valor que usa el admin al
 * crear esas variantes (ver ProductoFormClient.tsx). */
export const TALLE_UNICO = "Única";

/** Solo Polera y Polerón usan talles de ropa reales — el resto usa
 * TALLE_UNICO. Antes vivía duplicado en ProductoFormClient.tsx y
 * ProductoDetailClient.tsx. */
export function usaTalles(tipo: string): boolean {
  return tipo === "Polera" || tipo === "Poleron";
}
