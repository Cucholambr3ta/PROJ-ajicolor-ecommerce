"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

interface Banner {
  id: string;
  imageUrl: string;
  tipo: "Imagen" | "Video";
  linkUrl: string;
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next, banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="relative w-full h-[160px] lg:h-[220px] mb-6 thick-border overflow-hidden">
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((banner) => (
          <Link
            key={banner.id}
            href={banner.linkUrl}
            className="relative shrink-0 w-full h-full"
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
                sizes="100vw"
                priority={banners[0].id === banner.id}
              />
            )}
          </Link>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              onClick={() => setIndex(i)}
              aria-label={`Ir al banner ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
