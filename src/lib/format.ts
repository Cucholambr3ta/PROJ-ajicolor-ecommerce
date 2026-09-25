/** Formatea un monto en pesos chilenos con separador de miles: 16990 → "$16.990". */
export function formatCLP(monto: number | string): string {
  const n = typeof monto === "string" ? Number(monto) : monto;
  return `$${Math.round(n).toLocaleString("es-CL")}`;
}

/** Formatea una fecha en formato chileno corto: 15 de marzo de 2026. */
export function formatFecha(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
}

/** Formatea una fecha corta: 15/03/2026. */
export function formatFechaCorta(fecha: Date | string): string {
  const d = typeof fecha === "string" ? new Date(fecha) : fecha;
  return d.toLocaleDateString("es-CL");
}
