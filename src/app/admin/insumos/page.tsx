import { getMaterials } from "@/lib/actions/materials";
import { getSuppliers } from "@/lib/actions/suppliers";
import InsumosPageClient from "./InsumosPageClient";

export const dynamic = "force-dynamic";

export default async function InsumosPage() {
  const [materials, suppliers] = await Promise.all([getMaterials(), getSuppliers()]);
  const serializables = materials.map((m) => ({
    ...m,
    stock: Number(m.stock),
    costo: Number(m.costo),
  }));
  return <InsumosPageClient materials={serializables} suppliers={suppliers.map((s) => ({ id: s.id, nombre: s.nombre }))} />;
}
