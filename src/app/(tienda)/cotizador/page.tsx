import type { Metadata } from "next";
import { getPrendasActivas } from "@/lib/actions/cotizador";
import CotizadorClient from "@/components/cotizador/CotizadorClient";
import type { PrendaCotizador } from "@/components/cotizador/config";

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
        prendas={prendas.map((p): PrendaCotizador => ({
          id: p.id,
          nombre: p.nombre,
          slug: p.slug,
          descripcion: p.descripcion,
          precioBase: Number(p.precioBase),
          tallasDisponibles: p.tallasDisponibles,
          mockupFrenteUrl: p.mockupFrenteUrl,
          mockupEspaldaUrl: p.mockupEspaldaUrl,
          modelo3dUrl: p.modelo3dUrl,
          colores: p.colores.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            hex: c.hex,
          })),
          zonas: p.zonas.map((z) => ({
            lado: z.lado,
            anchoCm: Number(z.anchoCm),
            altoCm: Number(z.altoCm),
            x2d: Number(z.x2d),
            y2d: Number(z.y2d),
            w2d: Number(z.w2d),
            h2d: Number(z.h2d),
            pos3d: z.pos3d as [number, number, number],
            rot3d: z.rot3d as [number, number, number],
            size3d: z.size3d as [number, number, number],
          })),
        }))}
      />
    </main>
  );
}
