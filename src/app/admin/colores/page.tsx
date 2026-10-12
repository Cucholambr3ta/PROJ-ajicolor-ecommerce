import { getColors } from "@/lib/actions/colors";
import ColoresPageClient from "./ColoresPageClient";

export const dynamic = "force-dynamic";

export default async function ColoresPage() {
  const colores = await getColors();
  return <ColoresPageClient colores={colores} />;
}
