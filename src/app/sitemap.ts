import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/actions/products";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ajicolor.cl";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { items: products } = await getProducts({ perPage: 1000 });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/conoce-al-aji`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contacto`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terminos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/devoluciones`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/producto/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...productRoutes];
}
