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
    <Link href={banner.linkUrl} className="relative shrink-0 h-full w-screen">
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
          sizes="100vw"
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
 * contenido) y con el aspect-ratio real de las imágenes entregadas
 * (1920×420 ≈ 4.57:1) para que no se recorten de arriba/abajo.
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
    <div className="relative w-screen left-1/2 -translate-x-1/2 aspect-[1920/420] mb-6 border-y-2 border-ajicolor-ink overflow-hidden group">
      <div
        className="flex h-full w-max [animation:banner-marquee_var(--banner-speed)_linear_infinite] group-hover:[animation-play-state:paused]"
        style={{ "--banner-speed": `${velocidadSeg}s` } as React.CSSProperties}
      >
        {track.map((banner, i) => (
          <BannerItem key={`${banner.id}-${i}`} banner={banner} priority={i === 0} />
        ))}
      </div>
    </div>
  );
}
