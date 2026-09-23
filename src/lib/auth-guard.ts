import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Exige una sesión de admin (cualquier rol distinto de "Cliente").
 * Usar como primera línea de toda Server Action del panel admin.
 */
export async function requireAdmin(): Promise<Session> {
  const session = await auth();
  const rol = (session?.user as { rol?: string } | undefined)?.rol;
  if (!session?.user || rol === "Cliente") {
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
  const rol = (session?.user as { rol?: string } | undefined)?.rol;
  if (!session?.user?.id || rol !== "Cliente") {
    throw new Error("Debés iniciar sesión como cliente");
  }
  return session.user.id as string;
}
