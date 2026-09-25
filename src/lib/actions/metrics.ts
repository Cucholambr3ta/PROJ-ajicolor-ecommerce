"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-guard";

export async function getVentasUltimos30Dias() {
  await requireAdmin();
  const hoy = new Date();
  hoy.setHours(23, 59, 59, 999);
  const hace30Dias = new Date(hoy);
  hace30Dias.setDate(hace30Dias.getDate() - 29);
  hace30Dias.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      estado: "Entregado",
      createdAt: { gte: hace30Dias, lte: hoy },
    },
    select: { total: true, createdAt: true },
  });

  const porDia = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(hace30Dias);
    d.setDate(d.getDate() + i);
    porDia.set(d.toISOString().slice(0, 10), 0);
  }

  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    porDia.set(key, (porDia.get(key) ?? 0) + Number(order.total));
  }

  return Array.from(porDia.entries()).map(([fecha, total]) => ({ fecha, total }));
}

export async function getReporteEnvios() {
  await requireAdmin();
  const envios = await prisma.shipment.findMany({
    where: { estado: "Entregado", fechaDespacho: { not: null }, fechaEntrega: { not: null } },
    select: { fechaDespacho: true, fechaEntrega: true, costo: true, transportista: true },
  });

  if (envios.length === 0) {
    return { tiempoPromedioDias: 0, costoPromedio: 0, totalEnviosEntregados: 0 };
  }

  const tiemposDias = envios
    .filter((e) => e.fechaDespacho && e.fechaEntrega)
    .map((e) => (e.fechaEntrega!.getTime() - e.fechaDespacho!.getTime()) / (1000 * 60 * 60 * 24));

  const costos = envios.filter((e) => e.costo != null).map((e) => Number(e.costo));

  return {
    tiempoPromedioDias: tiemposDias.length > 0
      ? Number((tiemposDias.reduce((a, b) => a + b, 0) / tiemposDias.length).toFixed(1))
      : 0,
    costoPromedio: costos.length > 0
      ? Number((costos.reduce((a, b) => a + b, 0) / costos.length).toFixed(2))
      : 0,
    totalEnviosEntregados: envios.length,
  };
}

export async function getRotacionStock() {
  await requireAdmin();
  const treintaDiasAtras = new Date();
  treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

  const variants = await prisma.productVariant.findMany({
    include: {
      product: true,
      movements: {
        where: { tipo: "Salida", createdAt: { gte: treintaDiasAtras } },
      },
    },
  });

  return variants
    .map((v) => {
      const unidadesVendidas = v.movements.reduce((acc, m) => acc + Math.abs(m.cantidad), 0);
      const rotacion = v.stock > 0 ? Number((unidadesVendidas / v.stock).toFixed(2)) : 0;
      return {
        sku: v.sku,
        producto: v.product.nombreSlug,
        talle: v.talle,
        color: v.color,
        stockActual: v.stock,
        unidadesVendidas30d: unidadesVendidas,
        rotacion,
      };
    })
    .sort((a, b) => b.rotacion - a.rotacion);
}

export async function getMetricasResumen() {
  await requireAdmin();
  const [ventas30d, envios, rotacion] = await Promise.all([
    getVentasUltimos30Dias(),
    getReporteEnvios(),
    getRotacionStock(),
  ]);

  return {
    ventas30d,
    envios,
    rotacion,
    totalVentas30d: ventas30d.reduce((acc, v) => acc + v.total, 0),
  };
}

export async function exportPedidosCSV() {
  await requireAdmin();
  const orders = await prisma.order.findMany({
    include: { customer: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["ID", "Cliente", "Email", "Total", "Estado", "Canal", "Items", "Fecha"];
  const rows = orders.map((o) => [
    o.id,
    o.customer.nombre,
    o.customer.email,
    o.total.toString(),
    o.estado,
    o.canal,
    String(o.items.length),
    o.createdAt.toISOString(),
  ]);

  return buildCSV(headers, rows);
}

export async function exportStockCSV() {
  await requireAdmin();
  const variants = await prisma.productVariant.findMany({
    include: { product: true },
    orderBy: { sku: "asc" },
  });

  const headers = ["SKU", "Producto", "Talle", "Color", "Stock", "Stock Min"];
  const rows = variants.map((v) => [
    v.sku,
    v.product.nombreSlug,
    v.talle,
    v.color,
    String(v.stock),
    String(v.stockMin),
  ]);

  return buildCSV(headers, rows);
}

export async function exportClientesCSV() {
  await requireAdmin();
  const customers = await prisma.customer.findMany({
    include: { orders: true },
    orderBy: { fechaRegistro: "desc" },
  });

  const headers = ["ID", "Nombre", "Email", "Teléfono", "Pedidos", "Total Gastado", "BackstagePass"];
  const rows = customers.map((c) => [
    c.id,
    c.nombre,
    c.email,
    c.telefono ?? "",
    String(c.orders.length),
    c.totalGastado.toString(),
    c.backstagePass ? "Sí" : "No",
  ]);

  return buildCSV(headers, rows);
}

function buildCSV(headers: string[], rows: string[][]): string {
  const escape = (value: string) => {
    if (value.includes(",") || value.includes('"') || value.includes("\n")) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };
  const lines = [headers.map(escape).join(","), ...rows.map((row) => row.map(escape).join(","))];
  return lines.join("\n");
}
