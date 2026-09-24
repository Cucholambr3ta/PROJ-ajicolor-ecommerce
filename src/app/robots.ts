import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ajicolor.cl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/perfil", "/carrito", "/checkout", "/pedido"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
