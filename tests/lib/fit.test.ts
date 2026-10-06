import { describe, it, expect } from "vitest";
import { clampEscala, fitContain, centrarEnZona, ESCALA_MIN, ESCALA_MAX, ESCALA_DEFAULT } from "@/lib/cotizador/fit";

describe("clampEscala", () => {
  it("deja pasar valores dentro de rango", () => {
    expect(clampEscala(75)).toBe(75);
  });

  it("clampea valores por debajo del mínimo", () => {
    expect(clampEscala(10)).toBe(ESCALA_MIN);
    expect(clampEscala(49)).toBe(ESCALA_MIN);
  });

  it("clampea valores por encima del máximo", () => {
    expect(clampEscala(150)).toBe(ESCALA_MAX);
    expect(clampEscala(101)).toBe(ESCALA_MAX);
  });

  it("redondea decimales", () => {
    expect(clampEscala(75.6)).toBe(76);
  });
});

describe("fitContain", () => {
  const zonaCuadrada = { ancho: 100, alto: 100 };

  it("al 100% ocupa el máximo posible dentro de la zona sin deformar (aspect cuadrado)", () => {
    const resultado = fitContain({ ancho: 50, alto: 50 }, zonaCuadrada, ESCALA_DEFAULT);
    expect(resultado.ancho).toBe(100);
    expect(resultado.alto).toBe(100);
  });

  it("diseño panorámico (muy ancho): limita por el ancho de la zona", () => {
    const resultado = fitContain({ ancho: 2000, alto: 200 }, zonaCuadrada, ESCALA_DEFAULT);
    expect(resultado.ancho).toBeCloseTo(100, 5);
    expect(resultado.alto).toBeCloseTo(10, 5);
    // Aspect ratio preservado.
    expect(resultado.ancho / resultado.alto).toBeCloseTo(2000 / 200, 5);
  });

  it("diseño vertical (muy alto): limita por el alto de la zona", () => {
    const resultado = fitContain({ ancho: 200, alto: 2000 }, zonaCuadrada, ESCALA_DEFAULT);
    expect(resultado.alto).toBeCloseTo(100, 5);
    expect(resultado.ancho).toBeCloseTo(10, 5);
    expect(resultado.ancho / resultado.alto).toBeCloseTo(200 / 2000, 5);
  });

  it("zona no cuadrada con diseño cuadrado: limita por el lado más chico", () => {
    const zonaRectangular = { ancho: 45, alto: 60 };
    const resultado = fitContain({ ancho: 100, alto: 100 }, zonaRectangular, ESCALA_DEFAULT);
    expect(resultado.ancho).toBeCloseTo(45, 5);
    expect(resultado.alto).toBeCloseTo(45, 5);
  });

  it("escalaPct 50 reduce el resultado del 100% a la mitad", () => {
    const al100 = fitContain({ ancho: 50, alto: 50 }, zonaCuadrada, 100);
    const al50 = fitContain({ ancho: 50, alto: 50 }, zonaCuadrada, 50);
    expect(al50.ancho).toBeCloseTo(al100.ancho / 2, 5);
    expect(al50.alto).toBeCloseTo(al100.alto / 2, 5);
  });

  it("escalaPct fuera de rango se clampea antes de aplicarse (101 -> 100, 10 -> 50)", () => {
    const conExceso = fitContain({ ancho: 50, alto: 50 }, zonaCuadrada, 101);
    const al100 = fitContain({ ancho: 50, alto: 50 }, zonaCuadrada, 100);
    expect(conExceso).toEqual(al100);

    const conDefecto = fitContain({ ancho: 50, alto: 50 }, zonaCuadrada, 10);
    const al50min = fitContain({ ancho: 50, alto: 50 }, zonaCuadrada, ESCALA_MIN);
    expect(conDefecto).toEqual(al50min);
  });

  it("dimensiones inválidas (cero o negativas) devuelven tamaño cero en vez de NaN/Infinity", () => {
    expect(fitContain({ ancho: 0, alto: 50 }, zonaCuadrada)).toEqual({ ancho: 0, alto: 0 });
    expect(fitContain({ ancho: 50, alto: 50 }, { ancho: 0, alto: 100 })).toEqual({ ancho: 0, alto: 0 });
    expect(fitContain({ ancho: -10, alto: 50 }, zonaCuadrada)).toEqual({ ancho: 0, alto: 0 });
  });
});

describe("centrarEnZona", () => {
  it("centra un tamaño menor que la zona", () => {
    const offset = centrarEnZona({ ancho: 50, alto: 50 }, { ancho: 100, alto: 100 });
    expect(offset).toEqual({ x: 25, y: 25 });
  });

  it("offset cero cuando el tamaño ocupa toda la zona", () => {
    const offset = centrarEnZona({ ancho: 100, alto: 100 }, { ancho: 100, alto: 100 });
    expect(offset).toEqual({ x: 0, y: 0 });
  });

  it("maneja zonas rectangulares no cuadradas", () => {
    const offset = centrarEnZona({ ancho: 20, alto: 40 }, { ancho: 60, alto: 80 });
    expect(offset).toEqual({ x: 20, y: 20 });
  });
});
