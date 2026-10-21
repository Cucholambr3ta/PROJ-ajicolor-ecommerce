import { TALLES_ADULTO, TALLES_KIDS } from "@/lib/talles";
import type { CategoriaProducto, TipoProducto } from "@prisma/client";

/** Subconjunto de PriceRule que resolvePrecioFromRules/resolvePrecioDesdeFromRules
 * realmente leen — así se puede llamar tanto con filas de Prisma (Decimal,
 * con id/createdAt/updatedAt) como con el objeto ya serializado que recibe
 * un client component (precio ya convertido a number, sin esos campos). */
export type ReglaParaResolver = {
  tipo: TipoProducto;
  talleDesde: string;
  talleHasta: string;
  precio: unknown;
  productId: string | null;
};

/** Orden de talles de una categoría — determina qué cae "entre" desde/hasta
 * en una regla (ver resolvePrecioFromRules). */
function ordenTalles(categoria: CategoriaProducto): readonly string[] {
  return categoria === "Kids" ? TALLES_KIDS : TALLES_ADULTO;
}

function talleEnRango(talle: string, desde: string, hasta: string, orden: readonly string[]): boolean {
  const iTalle = orden.indexOf(talle);
  const iDesde = orden.indexOf(desde);
  const iHasta = orden.indexOf(hasta);
  if (iTalle === -1 || iDesde === -1 || iHasta === -1) return talle === desde && talle === hasta;
  return iTalle >= iDesde && iTalle <= iHasta;
}

export type ProductoParaPrecio = { id: string; tipo: TipoProducto; categoria: CategoriaProducto; precio: unknown };

/**
 * Resuelve el precio de un producto para un talle puntual, en memoria, a
 * partir de reglas ya cargadas (no pega a la DB) — pensado para usarse
 * dentro de un reduce/map sobre varios ítems sin hacer una query por ítem.
 * Orden de búsqueda: override del producto (productId) > regla global del
 * mismo tipo > Product.precio (campo legado, fallback para productos sin
 * ninguna regla todavía — ej. Reloj/Papelería/Totebag).
 */
export function resolvePrecioFromRules(product: ProductoParaPrecio, talle: string, rules: ReglaParaResolver[]): number {
  const orden = ordenTalles(product.categoria);
  const delProducto = rules.filter((r) => r.productId === product.id);
  const global = rules.filter((r) => r.productId === null && r.tipo === product.tipo);

  const porProducto = delProducto.find((r) => talleEnRango(talle, r.talleDesde, r.talleHasta, orden));
  if (porProducto) return Number(porProducto.precio);

  const porTipo = global.find((r) => talleEnRango(talle, r.talleDesde, r.talleHasta, orden));
  if (porTipo) return Number(porTipo.precio);

  return Number(product.precio);
}

/** Precio más bajo entre todas las reglas aplicables a un producto (override
 * + globales de su tipo) — para las tarjetas de grilla ("Desde $X"), que no
 * tienen un talle seleccionado todavía. */
export function resolvePrecioDesdeFromRules(product: ProductoParaPrecio, rules: ReglaParaResolver[]): number {
  const aplicables = rules.filter((r) => r.productId === product.id || (r.productId === null && r.tipo === product.tipo));
  const delProducto = aplicables.filter((r) => r.productId === product.id);
  // Si el producto tiene cualquier override propio, ese override reemplaza
  // TODAS las reglas globales para ese producto (mismo criterio que
  // resolvePrecioFromRules: el override gana talle por talle) — así que acá
  // también hay que preferirlo por sobre mezclar mínimos de ambos.
  const fuente = delProducto.length > 0 ? delProducto : aplicables;
  if (fuente.length === 0) return Number(product.precio);
  return Math.min(...fuente.map((r) => Number(r.precio)));
}
