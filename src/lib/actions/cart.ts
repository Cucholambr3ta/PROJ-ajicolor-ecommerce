"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireCliente } from "@/lib/auth-guard";
import { addToCartSchema, updateCartItemSchema, checkoutAddressSchema, parseOrThrow } from "@/lib/schemas";
import { getStoreSettings } from "@/lib/actions/settings";
import type { MetodoEnvio } from "@prisma/client";

async function getOrCreateCart(customerId: string) {
  const existing = await prisma.cart.findUnique({ where: { customerId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { customerId } });
}

export async function getCart() {
  const customerId = await requireCliente();
  const cart = await getOrCreateCart(customerId);

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
  const session = await auth();
  if (!session?.user?.id || session.user.rol !== "Cliente") {
    return 0;
  }
  const cart = await prisma.cart.findUnique({
    where: { customerId: session.user.id },
    include: { items: true },
  });
  return cart?.items.reduce((acc, i) => acc + i.cantidad, 0) ?? 0;
}

// El negocio es bajo pedido: cualquier variante se puede agregar al carrito
// aunque tenga stock 0 (se produce en 5-7 días hábiles tras confirmar el
// pago). El stock > 0 representa piezas ya impresas (sobrantes de feria),
// no un límite de venta — no bloquea la compra.
export async function addToCart(variantIdInput: string, cantidadInput: number = 1) {
  const { variantId, cantidad } = parseOrThrow(addToCartSchema, { variantId: variantIdInput, cantidad: cantidadInput });
  const customerId = await requireCliente();
  const cart = await getOrCreateCart(customerId);

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

export async function updateCartItem(itemIdInput: string, cantidadInput: number) {
  const { itemId, cantidad } = parseOrThrow(updateCartItemSchema, { itemId: itemIdInput, cantidad: cantidadInput });
  const customerId = await requireCliente();
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });
  if (!item || item.cart.customerId !== customerId) throw new Error("Item no encontrado");

  if (cantidad <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return;
  }

  return prisma.cartItem.update({ where: { id: itemId }, data: { cantidad } });
}

export async function removeFromCart(itemId: string) {
  const customerId = await requireCliente();
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
  if (!item || item.cart.customerId !== customerId) throw new Error("Item no encontrado");
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
  const customerId = await requireCliente();
  const cart = await prisma.cart.findUnique({
    where: { customerId },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!cart || cart.items.length === 0) throw new Error("El carrito está vacío");

  const subtotal = cart.items.reduce(
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
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            cantidad: item.cantidad,
            precioUnit: item.variant.product.precio,
            costoUnit: item.variant.product.costoUnitario,
          })),
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return order;
}

export { sumarDiasHabiles };
