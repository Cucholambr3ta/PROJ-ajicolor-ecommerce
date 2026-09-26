import { describe, it, expect } from "vitest";
import {
  parseOrThrow,
  emailSchema,
  registerCustomerSchema,
  addToCartSchema,
  checkoutAddressSchema,
} from "@/lib/schemas";

describe("emailSchema", () => {
  it("normaliza el email a minúsculas y sin espacios", () => {
    expect(emailSchema.parse("  Foo@Ejemplo.COM  ")).toBe("foo@ejemplo.com");
  });

  it("rechaza un email inválido", () => {
    expect(emailSchema.safeParse("no-es-un-email").success).toBe(false);
  });
});

describe("registerCustomerSchema", () => {
  const base = {
    nombre: "Camila Reyes",
    email: "Camila@Test.CL",
    password: "password123",
    telefono: "+56912345678",
    direccion: "Santiago, Chile",
  };

  it("acepta datos válidos y normaliza el email", () => {
    const parsed = registerCustomerSchema.parse(base);
    expect(parsed.email).toBe("camila@test.cl");
  });

  it("rechaza contraseñas de menos de 8 caracteres", () => {
    expect(registerCustomerSchema.safeParse({ ...base, password: "1234567" }).success).toBe(false);
  });

  it("rechaza nombre vacío", () => {
    expect(registerCustomerSchema.safeParse({ ...base, nombre: "" }).success).toBe(false);
  });
});

describe("addToCartSchema", () => {
  it("rechaza cantidad 0 o negativa", () => {
    expect(addToCartSchema.safeParse({ variantId: "v1", cantidad: 0 }).success).toBe(false);
    expect(addToCartSchema.safeParse({ variantId: "v1", cantidad: -1 }).success).toBe(false);
  });

  it("rechaza cantidades mayores a 99", () => {
    expect(addToCartSchema.safeParse({ variantId: "v1", cantidad: 100 }).success).toBe(false);
  });

  it("acepta cantidad válida", () => {
    expect(addToCartSchema.safeParse({ variantId: "v1", cantidad: 2 }).success).toBe(true);
  });
});

describe("checkoutAddressSchema", () => {
  it("exige todos los campos de dirección", () => {
    const result = checkoutAddressSchema.safeParse({
      nombre: "Camila",
      telefono: "",
      calle: "Av. Siempre Viva",
      numero: "123",
      comuna: "Providencia",
      region: "RM",
    });
    expect(result.success).toBe(false);
  });
});

describe("parseOrThrow", () => {
  it("lanza un Error legible cuando la validación falla", () => {
    expect(() => parseOrThrow(addToCartSchema, { variantId: "", cantidad: 1 })).toThrow();
  });

  it("devuelve los datos parseados cuando es válido", () => {
    const result = parseOrThrow(addToCartSchema, { variantId: "v1", cantidad: 1 });
    expect(result).toEqual({ variantId: "v1", cantidad: 1 });
  });
});
