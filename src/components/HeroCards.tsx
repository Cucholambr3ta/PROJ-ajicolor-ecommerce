"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface HeroCard {
  href: string;
  bg: string;
  content: React.ReactNode;
  image?: string;
  imagePosition?: string;
}

export function HeroCards({ cards }: { cards: HeroCard[] }) {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-6 lg:h-[320px]">
      {cards.map((card, i) => (
        <Link
          key={card.href + i}
          href={card.href}
          onMouseEnter={() => setActive(i)}
          className={`hero-card relative thick-border flex overflow-hidden min-h-[160px] lg:min-h-0 hover:opacity-90 transition-opacity ${card.bg} ${
            i === active ? "hero-card-active" : ""
          }`}
        >
          {card.image && (
            <div className="hero-card-image absolute inset-0 pointer-events-none">
              <Image
                src={card.image}
                alt=""
                fill
                className="object-cover"
                style={{ objectPosition: card.imagePosition ?? "center" }}
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
            </div>
          )}
          {card.content}
        </Link>
      ))}
    </div>
  );
}
