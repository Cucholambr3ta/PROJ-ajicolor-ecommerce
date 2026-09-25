import { getCollectionsAdmin } from "@/lib/actions/collections";
import ColeccionesPageClient from "./ColeccionesPageClient";

export const dynamic = "force-dynamic";

export default async function ColeccionesPage() {
  const colecciones = await getCollectionsAdmin();
  return <ColeccionesPageClient colecciones={colecciones} />;
}
