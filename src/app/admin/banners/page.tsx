import { getBanners } from "@/lib/actions/banners";
import BannersPageClient from "./BannersPageClient";

export const dynamic = "force-dynamic";

export default async function BannersPage() {
  const banners = await getBanners();

  return (
    <BannersPageClient
      banners={banners.map((b) => ({
        id: b.id,
        imageUrl: b.imageUrl,
        linkUrl: b.linkUrl,
        orden: b.orden,
        activo: b.activo,
      }))}
    />
  );
}
