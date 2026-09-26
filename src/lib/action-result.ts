/**
 * Resultado tipado para Server Actions llamadas desde el cliente.
 *
 * Next.js oculta el mensaje real de cualquier error lanzado (`throw`) desde
 * una Server Action cuando corre en producción, y lo reemplaza por un
 * mensaje genérico en inglés — así se pierden mensajes como "email ya
 * existe" o "sin stock". Las actions que el usuario debe poder leer
 * devuelven este tipo en vez de tirar, y el cliente rama sobre `ok`.
 */
export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string };

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}

/**
 * Envuelve una función que puede lanzar (por ejemplo por `parseOrThrow` o una
 * regla de negocio) y la convierte en un `ActionResult`. Errores inesperados
 * (bugs, fallas de conexión) se re-lanzan para no ocultarlos en logs.
 */
export async function toActionResult<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    if (err instanceof Error) return fail(err.message);
    throw err;
  }
}
