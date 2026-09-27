import type { Metadata } from "next";
import { getPrendasActivas } from "@/lib/actions/cotizador";
import CotizadorClient from "./CotizadorClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Cotizador",
  description: "Personaliza tu merch: poleras, polerones, totebags y relojes con tu propio diseño.",
};

export default async function CotizadorPage() {
  const prendas = await getPrendasActivas();

  return (
    <main className="max-w-6xl mx-auto py-12 p-8">
      <h1 className="text-4xl font-black mb-2 border-b-2 border-ajicolor-ink pb-4">Cotizador</h1>
      <p className="text-sm text-gray-500 dark:text-neutral-400 mb-10">
        Sube tu diseño, elige la prenda y el color, y te enviamos una cotización a tu email.
      </p>

      <CotizadorClient
        prendas={prendas.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          slug: p.slug,
          descripcion: p.descripcion,
          precioBase: Number(p.precioBase),
          zonaAnchoCm: p.zonaAnchoCm != null ? Number(p.zonaAnchoCm) : null,
          zonaAltoCm: p.zonaAltoCm != null ? Number(p.zonaAltoCm) : null,
          tallasDisponibles: p.tallasDisponibles,
          mockupFrenteUrl: p.mockupFrenteUrl,
          colores: p.colores.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            hex: c.hex,
          })),
        }))}
      />
    </main>
  );
}
