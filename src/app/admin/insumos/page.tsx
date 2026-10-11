import { getMaterials, getGastoPorProveedor } from "@/lib/actions/materials";
import { getSuppliers } from "@/lib/actions/suppliers";
import InsumosPageClient from "./InsumosPageClient";

export const dynamic = "force-dynamic";

export default async function InsumosPage() {
  const [materials, suppliers, gastoPorProveedor] = await Promise.all([
    getMaterials(),
    getSuppliers(),
    getGastoPorProveedor(),
  ]);
  const serializables = materials.map((m) => ({
    ...m,
    stock: Number(m.stock),
    costo: Number(m.costo),
  }));
  return (
    <InsumosPageClient
      materials={serializables}
      suppliers={suppliers.map((s) => ({ id: s.id, nombre: s.nombre }))}
      gastoPorProveedor={{ porProveedor: gastoPorProveedor.porProveedor, totalGeneral: gastoPorProveedor.totalGeneral }}
    />
  );
}
