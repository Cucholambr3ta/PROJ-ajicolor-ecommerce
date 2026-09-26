/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    // Deshabilita AVIF: mitiga GHSA-2xp9-vwfh-vxw4 (RCE en la API de Image
    // Optimization al decodificar AVIF), sin fix disponible en Next 14.x.
    formats: ["image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
