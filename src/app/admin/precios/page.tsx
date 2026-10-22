import { getPriceRules } from "@/lib/pricing";
import { getTallaGuias } from "@/lib/actions/tallaGuia";
import PreciosPageClient from "./PreciosPageClient";

export const dynamic = "force-dynamic";

export default async function PreciosPage() {
  const [reglas, guias] = await Promise.all([getPriceRules(), getTallaGuias()]);
  return (
    <PreciosPageClient
      reglas={reglas
        .filter((r) => r.productId === null)
        .map((r) => ({ id: r.id, tipo: r.tipo, talleDesde: r.talleDesde, talleHasta: r.talleHasta, precio: Number(r.precio) }))}
      guias={guias.map((g) => ({ id: g.id, tipo: g.tipo, categoria: g.categoria, imageUrl: g.imageUrl }))}
    />
  );
}
