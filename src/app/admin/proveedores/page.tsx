import { getSuppliers } from "@/lib/actions/suppliers";
import ProveedoresPageClient from "./ProveedoresPageClient";

export const dynamic = "force-dynamic";

export default async function ProveedoresPage() {
  const proveedores = await getSuppliers();
  const proveedoresSerializables = proveedores.map((p) => ({
    ...p,
    costoBase: Number(p.costoBase),
    batches: p.batches.map((b) => ({ ...b, costoTotal: Number(b.costoTotal) })),
  }));
  return <ProveedoresPageClient proveedores={proveedoresSerializables} />;
}
