import { z } from "zod";

export function parseOrThrow<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    throw new Error(first ? `${first.path.join(".")}: ${first.message}` : "Datos inválidos");
  }
  return result.data;
}

export const addToCartSchema = z.object({
  variantId: z.string().min(1),
  cantidad: z.number().int().positive().max(99),
});

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1),
  cantidad: z.number().int().min(0).max(99),
});

export const checkoutAddressSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  telefono: z.string().trim().min(1, "El teléfono es obligatorio").max(30),
  calle: z.string().trim().min(1, "La calle es obligatoria").max(200),
  numero: z.string().trim().min(1, "El número es obligatorio").max(20),
  comuna: z.string().trim().min(1, "La comuna es obligatoria").max(100),
  region: z.string().trim().min(1, "La región es obligatoria").max(100),
});

export const registerCustomerSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(200),
  email: z.string().trim().email("Email inválido").max(200),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(200),
  telefono: z.string().trim().min(1, "El teléfono es obligatorio").max(30),
  direccion: z.string().trim().min(1, "La dirección es obligatoria").max(300),
});

export const updateCustomerSchema = z.object({
  nombre: z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email().max(200).optional(),
  telefono: z.string().trim().min(1).max(30).optional(),
  direccion: z.string().trim().min(1).max(300).optional(),
  backstagePass: z.boolean().optional(),
});

export const createProductSchema = z.object({
  nombreSlug: z.string().trim().min(1).max(200),
  descripcion: z.string().trim().max(2000),
  disenoUrl: z.string().trim().max(500),
  artista: z.string().trim().max(200),
  temporada: z.string().trim().max(100),
  precio: z.number().nonnegative(),
  variants: z
    .array(
      z.object({
        talle: z.string().trim().min(1),
        color: z.string().trim().min(1),
        sku: z.string().trim().min(1),
        stock: z.number().int().nonnegative().optional(),
        stockMin: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
});

export const createSupplierSchema = z.object({
  nombre: z.string().trim().min(1).max(200),
  contacto: z.string().trim().min(1).max(200),
  leadTimeDias: z.number().int().nonnegative(),
  costoBase: z.number().nonnegative(),
  calificacion: z.number().int().min(1).max(5),
});

export const adjustStockSchema = z.object({
  variantId: z.string().min(1),
  cantidad: z.number().int(),
  tipo: z.enum(["Entrada", "Salida", "Ajuste"]),
  origen: z.string().trim().min(1).max(200),
  descripcion: z.string().trim().max(500).optional(),
});

export const createOrderSchema = z.object({
  customerId: z.string().min(1),
  canal: z.string().trim().min(1).max(50),
  notas: z.string().trim().max(1000).optional(),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        cantidad: z.number().int().positive(),
        precioUnit: z.number().nonnegative(),
      })
    )
    .min(1),
});

export const createBatchSchema = z.object({
  supplierId: z.string().min(1),
  fechaEstimada: z.date(),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1),
        cantidad: z.number().int().positive(),
        costoUnitario: z.number().nonnegative(),
      })
    )
    .min(1),
});

export const createShipmentSchema = z.object({
  orderId: z.string().min(1),
  trackingNumber: z.string().trim().max(100).optional(),
  transportista: z.string().trim().max(100).optional(),
  costo: z.number().nonnegative().optional(),
  fechaEstimada: z.date().optional(),
});
