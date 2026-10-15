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
    <Link href={banner.linkUrl} className="relative shrink-0 h-full w-[85vw] sm:w-[520px]">
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
          sizes="(min-width: 640px) 520px, 85vw"
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
    <div className="relative w-full h-[160px] lg:h-[220px] mb-6 thick-border overflow-hidden group">
      <div
        className="flex h-full w-max gap-4 [animation:banner-marquee_var(--banner-speed)_linear_infinite] group-hover:[animation-play-state:paused]"
        style={{ "--banner-speed": `${velocidadSeg}s` } as React.CSSProperties}
      >
        {track.map((banner, i) => (
          <BannerItem key={`${banner.id}-${i}`} banner={banner} priority={i === 0} />
        ))}
      </div>
    </div>
  );
}
