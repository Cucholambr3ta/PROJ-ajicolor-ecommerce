import { getPendingReviews } from "@/lib/actions/reviews";
import ResenasPageClient from "./ResenasPageClient";

export const dynamic = "force-dynamic";

export default async function ResenasPage() {
  const resenas = await getPendingReviews();
  return <ResenasPageClient resenas={resenas} />;
}
