"use client";

import Link from "next/link";
import Image from "next/image";

interface Banner {
  id: string;
  imageUrl: string;
  tipo: "Imagen" | "Video";
  linkUrl: string;
}

function BannerItem({ banner, priority }: { banner: Banner; priority: boolean }) {
  return (
    <Link
      href={banner.linkUrl}
      className="relative shrink-0 h-full w-[88vw] sm:w-[640px] thick-border pop-shadow rounded-lg overflow-hidden"
    >
      {banner.tipo === "Video" ? (
        <video
          src={banner.imageUrl}
          className="absolute inset-0 w-full h-full object-cover"
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
          className="object-cover"
          sizes="(min-width: 640px) 640px, 88vw"
          priority={priority}
        />
      )}
    </Link>
  );
}

/**
 * Carrusel de movimiento continuo (marquee), sin pausas entre banners — el
 * track se arma con la lista duplicada una vez y se anima de 0% a -50% en
 * loop infinito, así el salto al reiniciar es invisible (el final del
 * primer set calza con el principio del segundo). `velocidadSeg` es
 * configurable desde /admin/configuracion.
 *
 * Full-bleed (ocupa todo el ancho de la pantalla, no el max-w del resto del
 * contenido). Cada banner es una tarjeta separada (ancho fijo, borde y
 * sombra "pop", con gap entre tarjetas) en vez de una sola imagen corrida
 * de punta a punta — así se nota dónde termina un banner y empieza el
 * siguiente mientras se desplazan.
 */
export function BannerCarousel({
  banners,
  velocidadSeg = 30,
}: {
  banners: Banner[];
  velocidadSeg?: number;
}) {
  if (banners.length === 0) return null;

  const track = [...banners, ...banners];

  return (
    <div className="relative w-screen left-1/2 -translate-x-1/2 h-[160px] sm:h-[200px] lg:h-[260px] mb-6 overflow-hidden group">
      <div
        className="flex h-full w-max gap-4 px-4 [animation:banner-marquee_var(--banner-speed)_linear_infinite] group-hover:[animation-play-state:paused]"
        style={{ "--banner-speed": `${velocidadSeg}s` } as React.CSSProperties}
      >
        {track.map((banner, i) => (
          <BannerItem key={`${banner.id}-${i}`} banner={banner} priority={i === 0} />
        ))}
      </div>
    </div>
  );
}
