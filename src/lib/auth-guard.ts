import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    throw new Error("Debes iniciar sesión como cliente");
  }
  return session.user.id;
}

/**
 * Confirma acceso a un pedido propio sin exigir sesión — para clientes que
 * compraron como invitado (carrito libre, ver checkout() en cart.ts) y
 * nunca tuvieron cuenta. Dos formas válidas de probar "es tu pedido":
 * sesión de cliente cuyo id coincide con order.customerId, o el email
 * exacto del dueño del pedido (el mismo dato que ya recibió por correo al
 * confirmar la compra). Ninguna de las dos expone datos de otros pedidos.
 */
export async function requireOrderAccess(orderId: string, emailInput?: string): Promise<void> {
  const session = await auth();
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { customer: true } });
  if (!order) throw new Error("Pedido no encontrado");

  if (session?.user?.rol === "Cliente" && session.user.id === order.customerId) return;

  const email = emailInput?.trim().toLowerCase();
  if (email && email === order.customer.email.toLowerCase()) return;

  throw new Error("No autorizado para ver este pedido");
}
