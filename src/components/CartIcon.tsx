import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { getCartCount } from "@/lib/actions/cart";

export default async function CartIcon() {
  const count = await getCartCount();

  return (
    <Link href="/carrito" className="relative p-2 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors" title="Carrito">
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-ajicolor-magenta text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </Link>
  );
}
