"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const PRODUCTOS = [
  { nombre: "Poleras", imagen: "/carousel/polera.png" },
  { nombre: "Polerones", imagen: "/carousel/poleron.png" },
  { nombre: "Totebag", imagen: "/carousel/totebag.png" },
  { nombre: "Relojes", imagen: "/carousel/reloj.png" },
  { nombre: "Cuadros", imagen: "/carousel/cuadro.png" },
];

export function ProductCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % PRODUCTOS.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-full w-full [perspective:1000px]">
      {PRODUCTOS.map((producto, i) => {
        const isActive = i === index;
        const isPrev = i === (index - 1 + PRODUCTOS.length) % PRODUCTOS.length;
        return (
          <div
            key={producto.nombre}
            className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-out [transform-style:preserve-3d]"
            style={{
              opacity: isActive ? 1 : 0,
              transform: isActive ? "rotateY(0deg)" : isPrev ? "rotateY(90deg)" : "rotateY(-90deg)",
            }}
            aria-hidden={!isActive}
          >
            <div className="relative h-full w-full">
              <Image src={producto.imagen} alt="" fill className="object-contain" sizes="200px" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
