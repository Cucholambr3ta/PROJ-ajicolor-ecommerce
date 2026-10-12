import type { Metadata } from "next";
import BuscarPedidoForm from "./BuscarPedidoForm";

export const metadata: Metadata = { title: "Seguimiento de pedido", robots: { index: false, follow: false } };

export default function BuscarPedidoPage() {
  return (
    <main className="max-w-md mx-auto py-16 p-8">
      <h1 className="text-2xl font-black mb-2">Seguimiento de pedido</h1>
      <p className="text-sm text-gray-500 dark:text-neutral-400 mb-8">
        Ingresa el número de tu pedido y el email con el que compraste para ver el detalle y subir
        tu comprobante de transferencia.
      </p>
      <BuscarPedidoForm />
    </main>
  );
}
