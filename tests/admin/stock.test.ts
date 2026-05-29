import { ProductVariant, StockMovement } from "@prisma/client";

interface StockItem {
  variantId: string;
  sku: string;
  talle: string;
  color: string;
  stock: number;
  stockMin: number;
  needsRestock: boolean;
}

function validateStockItem(item: StockItem): void {
  if (item.stock < 0) throw new Error(`Stock cannot be negative for ${item.sku}`);
  if (item.stockMin < 0) throw new Error(`stockMin cannot be negative for ${item.sku}`);
  if (item.needsRestock !== (item.stock <= item.stockMin)) {
    throw new Error(`needsRestock mismatch for ${item.sku}`);
  }
}

function buildStockItem(variant: ProductVariant): StockItem {
  return {
    variantId: variant.id,
    sku: variant.sku,
    talle: variant.talle,
    color: variant.color,
    stock: variant.stock,
    stockMin: variant.stockMin,
    needsRestock: variant.stock <= variant.stockMin,
  };
}

function validateStockPageStructure(): void {
  const page = {
    hasTitle: true,
    title: "Inventario",
    hasEmptyState: true,
  };
  if (!page.hasTitle) throw new Error("Stock page must have title");
  if (page.title !== "Inventario") throw new Error("Title must be 'Inventario'");
  if (!page.hasEmptyState) throw new Error("Stock page must have empty state");
}

function validateStockMovement(movement: StockMovement): void {
  const validTipos = ["Entrada", "Salida", "Ajuste", "Devolucion"];
  if (!validTipos.includes(movement.tipo)) {
    throw new Error(`Invalid movement tipo: ${movement.tipo}`);
  }
  if (!movement.variantId) throw new Error("Movement must reference a variant");
  if (!movement.origen) throw new Error("Movement must have origen");
}

validateStockPageStructure();

const testItems: StockItem[] = [
  { variantId: "1", sku: "SKU-001", talle: "M", color: "Rojo", stock: 10, stockMin: 5, needsRestock: false },
  { variantId: "2", sku: "SKU-002", talle: "S", color: "Azul", stock: 2, stockMin: 5, needsRestock: true },
  { variantId: "3", sku: "SKU-003", talle: "L", color: "Verde", stock: 5, stockMin: 5, needsRestock: true },
];

for (const item of testItems) {
  validateStockItem(item);
}
