import { getSuppliers } from "@/lib/actions/suppliers";
import ProveedoresPageClient from "./ProveedoresPageClient";

export const dynamic = "force-dynamic";

export default async function ProveedoresPage() {
  const proveedores = await getSuppliers();
  return <ProveedoresPageClient proveedores={proveedores} />;
}
