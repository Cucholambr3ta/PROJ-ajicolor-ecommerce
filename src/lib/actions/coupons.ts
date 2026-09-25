"use server";

import { prisma } from "@/lib/prisma";
import { type ActionResult, toActionResult } from "@/lib/action-result";

export interface CouponPreview {
  id: string;
  codigo: string;
  tipo: string;
  valor: number;
  descuento: number;
}

/** Valida un cupón contra un subtotal dado y devuelve el descuento que aplicaría. */
export async function validateCoupon(codigo: string, subtotal: number): Promise<ActionResult<CouponPreview>> {
  return toActionResult(async () => {
    const coupon = await prisma.coupon.findUnique({ where: { codigo: codigo.trim().toUpperCase() } });
    if (!coupon || !coupon.activo) throw new Error("Cupón no válido");
    if (coupon.vigenteHasta && coupon.vigenteHasta < new Date()) throw new Error("Este cupón ya expiró");
    if (coupon.vigenteDesde > new Date()) throw new Error("Este cupón todavía no está vigente");
    if (coupon.usosMaximos != null && coupon.usosActuales >= coupon.usosMaximos) {
      throw new Error("Este cupón ya alcanzó su límite de usos");
    }
    if (coupon.montoMinimo != null && subtotal < Number(coupon.montoMinimo)) {
      throw new Error(`Este cupón requiere un mínimo de compra de $${Number(coupon.montoMinimo).toLocaleString("es-CL")}`);
    }

    let descuento = 0;
    if (coupon.tipo === "porcentaje") {
      descuento = Math.round((subtotal * Number(coupon.valor)) / 100);
    } else if (coupon.tipo === "monto") {
      descuento = Math.min(Number(coupon.valor), subtotal);
    }
    // "envio_gratis" no descuenta del subtotal; se resuelve en el costo de envío al confirmar el pedido.

    return { id: coupon.id, codigo: coupon.codigo, tipo: coupon.tipo, valor: Number(coupon.valor), descuento };
  });
}
