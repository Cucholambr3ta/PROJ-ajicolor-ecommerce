"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireCustomerId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id || (session.user as { rol?: string }).rol !== "Cliente") {
    throw new Error("Debés iniciar sesión como cliente");
  }
  return session.user.id as string;
}

async function getOrCreateCart(customerId: string) {
  const existing = await prisma.cart.findUnique({ where: { customerId } });
  if (existing) return existing;
  return prisma.cart.create({ data: { customerId } });
}

export async function getCart() {
  const customerId = await requireCustomerId();
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

export async function addToCart(variantId: string, cantidad: number = 1) {
  const customerId = await requireCustomerId();
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

export async function updateCartItem(itemId: string, cantidad: number) {
  const customerId = await requireCustomerId();
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
  const customerId = await requireCustomerId();
  const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
  if (!item || item.cart.customerId !== customerId) throw new Error("Item no encontrado");
  return prisma.cartItem.delete({ where: { id: itemId } });
}

export async function checkout() {
  const customerId = await requireCustomerId();
  const cart = await prisma.cart.findUnique({
    where: { customerId },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!cart || cart.items.length === 0) throw new Error("El carrito está vacío");

  for (const item of cart.items) {
    if (item.cantidad > item.variant.stock) {
      throw new Error(`Sin stock suficiente para ${item.variant.product.nombreSlug}`);
    }
  }

  const total = cart.items.reduce(
    (acc, item) => acc + Number(item.variant.product.precio) * item.cantidad,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        customerId,
        total,
        estado: "Pendiente",
        canal: "Web",
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
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.cantidad } },
      });
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
