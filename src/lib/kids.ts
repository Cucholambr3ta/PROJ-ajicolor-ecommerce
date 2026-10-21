/** Talles por edad de la línea Kids. La paleta de colores ya no vive acá —
 * se migró a la tabla Color (administrable desde /admin/colores), ver
 * src/lib/actions/colors.ts. El talle en sí se centralizó en
 * src/lib/talles.ts (junto con TALLES_ADULTO) — este archivo re-exporta
 * para no romper los imports existentes de "@/lib/kids". */
export { TALLES_KIDS } from "@/lib/talles";
