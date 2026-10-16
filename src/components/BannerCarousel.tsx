"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/splide/css/core";

interface Banner {
  id: string;
  imageUrl: string;
  tipo: "Imagen" | "Video";
  linkUrl: string;
}

/**
 * Carrusel full-width, un banner a la vez, loop infinito sin saltos,
 * deslizamiento 400ms, autoplay cada 5s, pausa al pasar el mouse,
 * arrastrable (mouse/touch) y navegable con teclado (flechas) — Splide
 * ya resuelve bien todo eso en vez de reimplementarlo a mano.
 * `velocidadSeg` (configurable desde /admin/configuracion) controla el
 * intervalo de autoplay.
 */
export function BannerCarousel({
  banners,
  velocidadSeg = 5,
}: {
  banners: Banner[];
  velocidadSeg?: number;
}) {
  const router = useRouter();

  if (banners.length === 0) return null;

  return (
    <div className="banner-carousel w-screen relative left-1/2 -translate-x-1/2 mb-6 px-8 sm:px-12 lg:px-16">
      <Splide
        className="aspect-[1920/420] h-auto"
        options={{
          type: "loop",
          perPage: 1,
          perMove: 1,
          gap: 0,
          arrows: banners.length > 1,
          pagination: banners.length > 1,
          autoplay: banners.length > 1,
          interval: velocidadSeg * 1000,
          pauseOnHover: true,
          pauseOnFocus: false,
          drag: true,
          speed: 400,
          keyboard: "global",
          waitForTransition: false,
        }}
        aria-label="Banners destacados"
      >
        {banners.map((banner) => (
          <SplideSlide key={banner.id}>
            <button
              type="button"
              onClick={() => router.push(banner.linkUrl)}
              className="relative block w-full h-full cursor-pointer"
              aria-label="Ver más"
            >
              {banner.tipo === "Video" ? (
                <video
                  src={banner.imageUrl}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={banner.imageUrl}
                  alt=""
                  fill
                  className="object-cover object-center"
                  sizes="100vw"
                />
              )}
            </button>
          </SplideSlide>
        ))}
      </Splide>
    </div>
  );
}
