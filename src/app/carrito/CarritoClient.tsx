"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

interface CartItemData {
  id: string;
  cantidad: number;
  variant: {
    talle: string;
    color: string;
    stock: number;
    product: { id: string; nombreSlug: string; disenoUrl: string; precio: number | any };
  };
}

export default function CarritoClient({ items, total }: { items: CartItemData[]; total: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleUpdate(itemId: string, cantidad: number) {
    setLoading(itemId);
    setError("");
    try {
      const { updateCartItem } = await import("@/lib/actions/cart");
      await updateCartItem(itemId, cantidad);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar");
    } finally {
      setLoading(null);
    }
  }

  async function handleRemove(itemId: string) {
    setLoading(itemId);
    setError("");
    try {
      const { removeFromCart } = await import("@/lib/actions/cart");
      await removeFromCart(itemId);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setLoading(null);
    }
  }

  function handleCheckout() {
    router.push("/checkout");
  }

  if (items.length === 0) {
    return (
      <div className="p-10 border-2 border-dashed border-gray-300 dark:border-neutral-700 text-center">
        <p className="text-gray-400 dark:text-neutral-500 font-medium mb-4">Tu carrito está vacío.</p>
        <Link href="/" className="btn-block bg-ajicolor-yellow inline-flex">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <div key={item.id} className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-4 flex gap-4 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.variant.product.disenoUrl}
            alt={item.variant.product.nombreSlug}
            className="w-20 h-20 object-cover thick-border"
          />
          <div className="flex-1">
            <h3 className="font-black">{item.variant.product.nombreSlug}</h3>
            <p className="text-xs text-gray-400 dark:text-neutral-500 font-medium">
              {item.variant.talle} / {item.variant.color}
            </p>
            <p className="text-ajicolor-magenta font-black">
              ${Number(item.variant.product.precio).toLocaleString("es-CL")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleUpdate(item.id, item.cantidad - 1)}
              disabled={loading === item.id}
              className="w-8 h-8 thick-border bg-white dark:bg-neutral-900 font-black disabled:opacity-50"
            >
              −
            </button>
            <span className="w-8 text-center font-bold">{item.cantidad}</span>
            <button
              onClick={() => handleUpdate(item.id, item.cantidad + 1)}
              disabled={loading === item.id || item.cantidad >= item.variant.stock}
              className="w-8 h-8 thick-border bg-white dark:bg-neutral-900 font-black disabled:opacity-50"
            >
              +
            </button>
          </div>
          <button
            onClick={() => handleRemove(item.id)}
            disabled={loading === item.id}
            className="text-xs font-bold uppercase text-ajicolor-magenta hover:underline disabled:opacity-50"
          >
            Quitar
          </button>
        </div>
      ))}

      {error && <p className="text-sm font-semibold text-ajicolor-magenta">{error}</p>}

      <div className="bg-white dark:bg-neutral-900 thick-border pop-shadow p-6 flex items-center justify-between">
        <span className="font-black text-lg">Total</span>
        <span className="font-black text-2xl text-ajicolor-magenta">${total.toLocaleString("es-CL")}</span>
      </div>

      <button
        onClick={handleCheckout}
        className="btn-block w-full bg-ajicolor-green text-white justify-center py-4 text-base"
      >
        Continuar al pago
      </button>
    </div>
  );
}
