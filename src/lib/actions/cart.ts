"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { addToCartSchema, updateCartItemSchema, checkoutAddressSchema, parseOrThrow } from "@/lib/schemas";
import { getStoreSettings } from "@/lib/actions/settings";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import type { MetodoEnvio } from "@prisma/client";

const CART_TOKEN_COOKIE = "cart_token";

/** Lee el token del carrito anónimo desde la cookie, sin crearlo. */
async function readCartToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_TOKEN_COOKIE)?.value ?? null;
}

/** Lee el token del carrito anónimo y lo crea (cookie httpOnly) si no existe. */
async function getOrSetCartToken(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CART_TOKEN_COOKIE)?.value;
  if (existing) return existing;

  const token = randomUUID();
  store.set(CART_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 90,
    path: "/",
  });
  return token;
}

/**
 * Devuelve el carrito activo: si hay sesión de cliente, el carrito del
 * cliente (fusionando primero cualquier carrito anónimo de la cookie).
 * Si no hay sesión, el carrito anónimo por cookie.
 */
async function resolveCart(createIfMissing: boolean) {
  const session = await auth();
  const customerId = session?.user?.rol === "Cliente" ? session.user.id : undefined;

  if (customerId) {
    const guestToken = await readCartToken();
    if (guestToken) {
      await mergeGuestCartInto(customerId, guestToken);
    }
    const existing = await prisma.cart.findUnique({ where: { customerId } });
    if (existing) return existing;
    if (!createIfMissing) return null;
    return prisma.cart.create({ data: { customerId } });
  }

  const token = createIfMissing ? await getOrSetCartToken() : await readCartToken();
  if (!token) return null;

  const existing = await prisma.cart.findUnique({ where: { token } });
  if (existing) return existing;
  if (!createIfMissing) return null;
  return prisma.cart.create({ data: { token } });
}

/** Traspasa los items del carrito anónimo (por token) al carrito del cliente. */
async function mergeGuestCartInto(customerId: string, guestToken: string) {
  const guestCart = await prisma.cart.findUnique({
    where: { token: guestToken },
    include: { items: true },
  });
  if (!guestCart || guestCart.items.length === 0) {
    if (guestCart) await prisma.cart.delete({ where: { id: guestCart.id } });
    return;
  }

  const customerCart = await prisma.cart.upsert({
    where: { customerId },
    create: { customerId },
    update: {},
  });

  for (const item of guestCart.items) {
    const existing = await prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: customerCart.id, variantId: item.variantId } },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { cantidad: existing.cantidad + item.cantidad },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: customerCart.id, variantId: item.variantId, cantidad: item.cantidad },
      });
    }
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
}

export async function getCart() {
  const cart = await resolveCart(false);
  if (!cart) return null;

  return prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: { variant: { include: { product: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getCartCount() {
  const cart = await resolveCart(false);
  if (!cart) return 0;
  const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
  return items.reduce((acc, i) => acc + i.cantidad, 0);
}

// El negocio es bajo pedido: cualquier variante se puede agregar al carrito
// aunque tenga stock 0 (se produce en 5-7 días hábiles tras confirmar el
// pago). El stock > 0 representa piezas ya impresas (sobrantes de feria),
// no un límite de venta — no bloquea la compra. El carrito es libre: no
// requiere sesión, se identifica por cookie hasta que el cliente paga.
export async function addToCart(variantIdInput: string, cantidadInput: number = 1) {
  const { variantId, cantidad } = parseOrThrow(addToCartSchema, { variantId: variantIdInput, cantidad: cantidadInput });
  const cart = await resolveCart(true);
  if (!cart) throw new Error("No se pudo crear el carrito");

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) throw new Error("Variante no encontrada");

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { cantidad: existing.cantidad + cantidad },
    });
  }

  return prisma.cartItem.create({
    data: { cartId: cart.id, variantId, cantidad },
  });
}

async function assertOwnsItem(itemId: string) {
  const cart = await resolveCart(false);
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
  if (!item || !cart || item.cartId !== cart.id) throw new Error("Item no encontrado");
  return item;
}

export async function updateCartItem(itemIdInput: string, cantidadInput: number) {
  const { itemId, cantidad } = parseOrThrow(updateCartItemSchema, { itemId: itemIdInput, cantidad: cantidadInput });
  await assertOwnsItem(itemId);

  if (cantidad <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return;
  }

  return prisma.cartItem.update({ where: { id: itemId }, data: { cantidad } });
}

export async function removeFromCart(itemId: string) {
  await assertOwnsItem(itemId);
  return prisma.cartItem.delete({ where: { id: itemId } });
}

/** Costo de envío según el método elegido. Starken es "por pagar" (no se cobra online). */
async function costoEnvioPara(metodo: MetodoEnvio): Promise<number> {
  if (metodo === "StarkenPorPagar") return 0;
  const settings = await getStoreSettings();
  return Number(settings.costoEnvioCorreos);
}

/** Suma N días hábiles (lunes a viernes) a una fecha. */
function sumarDiasHabiles(desde: Date, dias: number): Date {
  const resultado = new Date(desde);
  let restantes = dias;
  while (restantes > 0) {
    resultado.setDate(resultado.getDate() + 1);
    const diaSemana = resultado.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) restantes--;
  }
  return resultado;
}

export async function checkout(direccionInput: {
  nombre: string;
  telefono: string;
  calle: string;
  numero: string;
  comuna: string;
  region: string;
  metodoEnvio?: MetodoEnvio;
}) {
  const { metodoEnvio: metodoEnvioInput, ...direccionData } = direccionInput;
  const direccion = parseOrThrow(checkoutAddressSchema, direccionData);
  const metodoEnvio: MetodoEnvio = metodoEnvioInput ?? "CorreosSucursal";

  const session = await auth();
  if (session?.user?.rol !== "Cliente") throw new Error("Debes iniciar sesión para pagar");
  const customerId = session.user.id;

  const cart = await resolveCart(false);
  const cartWithItems = cart
    ? await prisma.cart.findUnique({
        where: { id: cart.id },
        include: { items: { include: { variant: { include: { product: true } } } } },
      })
    : null;

  if (!cartWithItems || cartWithItems.items.length === 0) throw new Error("El carrito está vacío");

  const subtotal = cartWithItems.items.reduce(
    (acc, item) => acc + Number(item.variant.product.precio) * item.cantidad,
    0
  );
  const costoEnvio = await costoEnvioPara(metodoEnvio);
  const total = subtotal + costoEnvio;

  // Venta bajo pedido: NO se descuenta stock al comprar. El pedido queda
  // Pendiente/PendienteTransferencia hasta que el admin confirme el pago
  // (confirmPayment en payments.ts), momento en que recién entra a la cola
  // de producción. Evita reservar stock que en la práctica no existe.
  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        customerId,
        subtotal,
        costoEnvio,
        total,
        estado: "Pendiente",
        estadoPago: "PendienteTransferencia",
        canal: "Web",
        metodoEnvio,
        envioNombre: direccion.nombre,
        envioTelefono: direccion.telefono,
        envioCalle: direccion.calle,
        envioNumero: direccion.numero,
        envioComuna: direccion.comuna,
        envioRegion: direccion.region,
        items: {
          create: cartWithItems.items.map((item) => ({
            variantId: item.variantId,
            cantidad: item.cantidad,
            precioUnit: item.variant.product.precio,
            costoUnit: item.variant.product.costoUnitario,
          })),
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cartWithItems.id } });

    return newOrder;
  });

  return order;
}

export { sumarDiasHabiles };
