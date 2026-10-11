/** Constantes de la línea Kids — talles por edad y paleta de colores propia
 * (distinta de la paleta adulto en ProductoDetailClient.tsx). Mismo patrón de
 * slug por color para la convención de carpetas public/productos/<slug>/. */

export const TALLES_KIDS = ["2-4", "6-8", "10-12", "14-16"] as const;

export interface ColorKids {
  nombre: string;
  hex: string;
  slug: string;
}

export const PALETA_KIDS: ColorKids[] = [
  { nombre: "Negro", hex: "#000000", slug: "negro" },
  { nombre: "Morado", hex: "#8D02BF", slug: "morado" },
  { nombre: "Azul Marino", hex: "#224D8F", slug: "azul-marino" },
  { nombre: "Verde Jade", hex: "#00A36C", slug: "verde-jade" },
  { nombre: "Rojo", hex: "#E30500", slug: "rojo" },
  { nombre: "Naranja", hex: "#FB4800", slug: "naranja" },
  { nombre: "Rosado", hex: "#D891EF", slug: "rosado" },
  { nombre: "Amarillo", hex: "#FFEE00", slug: "amarillo" },
  { nombre: "Celeste", hex: "#A4C8E1", slug: "celeste" },
  { nombre: "Blanco", hex: "#FFFFFF", slug: "blanco" },
];

export const COLOR_HEX_KIDS: Record<string, string> = Object.fromEntries(
  PALETA_KIDS.map((c) => [c.nombre, c.hex])
);
