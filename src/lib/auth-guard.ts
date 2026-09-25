import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Roles válidos de administrador. Lista blanca explícita: una sesión con
 * `rol` vacío, nulo o desconocido (ej. un login OAuth mal configurado) NO
 * pasa como admin solo por no ser "Cliente".
 */
export const ADMIN_ROLES = ["Propietario"] as const;

/**
 * Exige una sesión de admin con un rol conocido.
 * Usar como primera línea de toda Server Action del panel admin.
 */
export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  const rol = session?.user?.rol;
  if (!session?.user || !ADMIN_ROLES.includes(rol as (typeof ADMIN_ROLES)[number])) {
    throw new Error("No autorizado");
  }
  return session;
}

/**
 * Exige una sesión de cliente y devuelve su id.
 * Usar como primera línea de toda Server Action de la tienda pública.
 */
export async function requireCliente(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id || session.user.rol !== "Cliente") {
    throw new Error("Debés iniciar sesión como cliente");
  }
  return session.user.id;
}
