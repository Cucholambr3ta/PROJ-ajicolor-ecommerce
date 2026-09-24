"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireCliente } from "@/lib/auth-guard";
import { addToCartSchema, updateCartItemSchema, checkoutAddressSchema, parseOrThrow } from "@/lib/schemas";

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
  if (!session?.user?.id || (session.user as { rol?: string }).rol !== "Cliente") {
    return 0;
  }
  const cart = await prisma.cart.findUnique({
    where: { customerId: session.user.id as string },
    include: { items: true },
  });
  return cart?.items.reduce((acc, i) => acc + i.cantidad, 0) ?? 0;
}

export async function addToCart(variantIdInput: string, cantidadInput: number = 1) {
  const { variantId, cantidad } = parseOrThrow(addToCartSchema, { variantId: variantIdInput, cantidad: cantidadInput });
  const customerId = await requireCliente();
  const cart = await getOrCreateCart(customerId);

  const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!variant) throw new Error("Variante no encontrada");
  if (variant.stock < cantidad) throw new Error("Stock insuficiente");

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_variantId: { cartId: cart.id, variantId } },
  });

  if (existing) {
    const nuevaCantidad = existing.cantidad + cantidad;
    if (nuevaCantidad > variant.stock) throw new Error("Stock insuficiente");
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { cantidad: nuevaCantidad },
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
    include: { cart: true, variant: true },
  });
  if (!item || item.cart.customerId !== customerId) throw new Error("Item no encontrado");

  if (cantidad <= 0) {
    await prisma.cartItem.delete({ where: { id: itemId } });
    return;
  }
  if (cantidad > item.variant.stock) throw new Error("Stock insuficiente");

  return prisma.cartItem.update({ where: { id: itemId }, data: { cantidad } });
}

export async function removeFromCart(itemId: string) {
  const customerId = await requireCliente();
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
  if (!item || item.cart.customerId !== customerId) throw new Error("Item no encontrado");
  return prisma.cartItem.delete({ where: { id: itemId } });
}

const COSTO_ENVIO = 5000;

export async function checkout(direccionInput: {
  nombre: string;
  telefono: string;
  calle: string;
  numero: string;
  comuna: string;
  region: string;
}) {
  const direccion = parseOrThrow(checkoutAddressSchema, direccionInput);
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
  const total = subtotal + COSTO_ENVIO;

  const order = await prisma.$transaction(async (tx) => {
    // Descuenta stock de forma atómica: el `updateMany` solo afecta filas con
    // stock >= cantidad. Si `count` da 0, alguien más se llevó el stock primero
    // y abortamos toda la transacción (evita dejarlo negativo bajo concurrencia).
    for (const item of cart.items) {
      const result = await tx.productVariant.updateMany({
        where: { id: item.variantId, stock: { gte: item.cantidad } },
        data: { stock: { decrement: item.cantidad } },
      });
      if (result.count === 0) {
        throw new Error(`Sin stock suficiente para ${item.variant.product.nombreSlug}`);
      }
    }

    const newOrder = await tx.order.create({
      data: {
        customerId,
        subtotal,
        costoEnvio: COSTO_ENVIO,
        total,
        estado: "Pendiente",
        estadoPago: "PendienteTransferencia",
        canal: "Web",
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
          })),
        },
      },
    });

    for (const item of cart.items) {
      await tx.stockMovement.create({
        data: {
          variantId: item.variantId,
          cantidad: -item.cantidad,
          tipo: "Salida",
          origen: "Venta web",
          descripcion: `Pedido ${newOrder.id}`,
        },
      });
    }

    await tx.customer.update({
      where: { id: customerId },
      data: { totalGastado: { increment: total } },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return newOrder;
  });

  return order;
}
