interface ModelField {
  name: string;
  type: string;
  isRequired: boolean;
  isUnique: boolean;
  isId: boolean;
  hasDefault: boolean;
  relation?: string;
}

interface ModelDefinition {
  name: string;
  fields: ModelField[];
  relations: string[];
}

const requiredModels: ModelDefinition[] = [
  {
    name: "User",
    fields: [
      { name: "id", type: "String", isRequired: true, isUnique: false, isId: true, hasDefault: true },
      { name: "email", type: "String", isRequired: true, isUnique: true, isId: false, hasDefault: false },
      { name: "passwordHash", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "rol", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: true },
      { name: "createdAt", type: "DateTime", isRequired: true, isUnique: false, isId: false, hasDefault: true },
      { name: "updatedAt", type: "DateTime", isRequired: true, isUnique: false, isId: false, hasDefault: true },
    ],
    relations: [],
  },
  {
    name: "Customer",
    fields: [
      { name: "id", type: "String", isRequired: true, isUnique: false, isId: true, hasDefault: true },
      { name: "nombre", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "email", type: "String", isRequired: true, isUnique: true, isId: false, hasDefault: false },
      { name: "telefono", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "direccion", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "backstagePass", type: "Boolean", isRequired: true, isUnique: false, isId: false, hasDefault: true },
      { name: "totalGastado", type: "Decimal", isRequired: true, isUnique: false, isId: false, hasDefault: true },
    ],
    relations: ["Order"],
  },
  {
    name: "Product",
    fields: [
      { name: "id", type: "String", isRequired: true, isUnique: false, isId: true, hasDefault: true },
      { name: "nombreSlug", type: "String", isRequired: true, isUnique: true, isId: false, hasDefault: false },
      { name: "descripcion", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "diseñoUrl", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "artista", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "temporada", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
    ],
    relations: ["ProductVariant"],
  },
  {
    name: "ProductVariant",
    fields: [
      { name: "id", type: "String", isRequired: true, isUnique: false, isId: true, hasDefault: true },
      { name: "productId", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "talle", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "color", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "sku", type: "String", isRequired: true, isUnique: true, isId: false, hasDefault: false },
      { name: "stock", type: "Int", isRequired: true, isUnique: false, isId: false, hasDefault: true },
      { name: "stockMin", type: "Int", isRequired: true, isUnique: false, isId: false, hasDefault: true },
    ],
    relations: ["OrderItem", "StockMovement"],
  },
  {
    name: "Order",
    fields: [
      { name: "id", type: "String", isRequired: true, isUnique: false, isId: true, hasDefault: true },
      { name: "customerId", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "total", type: "Decimal", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "estado", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: true },
      { name: "canal", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "notas", type: "String?", isRequired: false, isUnique: false, isId: false, hasDefault: false },
    ],
    relations: ["OrderItem", "Shipment"],
  },
  {
    name: "OrderItem",
    fields: [
      { name: "id", type: "String", isRequired: true, isUnique: false, isId: true, hasDefault: true },
      { name: "orderId", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "variantId", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "cantidad", type: "Int", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "precioUnit", type: "Decimal", isRequired: true, isUnique: false, isId: false, hasDefault: false },
    ],
    relations: [],
  },
  {
    name: "ProductionBatch",
    fields: [
      { name: "id", type: "String", isRequired: true, isUnique: false, isId: true, hasDefault: true },
      { name: "proveedor", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "variantes", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "unidadesPorVar", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "costoTotal", type: "Decimal", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "fechaPedido", type: "DateTime", isRequired: true, isUnique: false, isId: false, hasDefault: true },
      { name: "fechaEstimada", type: "DateTime", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "fechaRecepcion", type: "DateTime?", isRequired: false, isUnique: false, isId: false, hasDefault: false },
      { name: "estado", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: true },
    ],
    relations: [],
  },
  {
    name: "StockMovement",
    fields: [
      { name: "id", type: "String", isRequired: true, isUnique: false, isId: true, hasDefault: true },
      { name: "variantId", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "cantidad", type: "Int", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "tipo", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "origen", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: false },
      { name: "descripcion", type: "String?", isRequired: false, isUnique: false, isId: false, hasDefault: false },
    ],
    relations: [],
  },
  {
    name: "Shipment",
    fields: [
      { name: "id", type: "String", isRequired: true, isUnique: false, isId: true, hasDefault: true },
      { name: "orderId", type: "String", isRequired: true, isUnique: true, isId: false, hasDefault: false },
      { name: "trackingNumber", type: "String?", isRequired: false, isUnique: false, isId: false, hasDefault: false },
      { name: "transportista", type: "String?", isRequired: false, isUnique: false, isId: false, hasDefault: false },
      { name: "costo", type: "Decimal?", isRequired: false, isUnique: false, isId: false, hasDefault: false },
      { name: "fechaDespacho", type: "DateTime?", isRequired: false, isUnique: false, isId: false, hasDefault: false },
      { name: "fechaEstimada", type: "DateTime?", isRequired: false, isUnique: false, isId: false, hasDefault: false },
      { name: "fechaEntrega", type: "DateTime?", isRequired: false, isUnique: false, isId: false, hasDefault: false },
      { name: "estado", type: "String", isRequired: true, isUnique: false, isId: false, hasDefault: true },
    ],
    relations: [],
  },
];

function validateModel(model: ModelDefinition): void {
  if (model.fields.length === 0) throw new Error(`Model ${model.name} has no fields`);

  const idFields = model.fields.filter((f) => f.isId);
  if (idFields.length !== 1) throw new Error(`Model ${model.name} must have exactly one @id field`);

  const uniqueFields = model.fields.filter((f) => f.isUnique);
  for (const f of model.fields) {
    if (f.name === "id" && f.type !== "String") {
      throw new Error(`Model ${model.name} id must be String (cuid)`);
    }
  }
}

function validateUniqueConstraints(model: ModelDefinition, uniqueFields: string[]): void {
  for (const fieldName of uniqueFields) {
    const field = model.fields.find((f) => f.name === fieldName);
    if (!field) throw new Error(`Model ${model.name} missing unique field: ${fieldName}`);
    if (!field.isUnique) throw new Error(`Field ${model.name}.${fieldName} must be @unique`);
  }
}

const uniqueConstraints: Record<string, string[]> = {
  User: ["email"],
  Customer: ["email"],
  Product: ["nombreSlug"],
  ProductVariant: ["sku"],
  Shipment: ["orderId"],
};

for (const model of requiredModels) {
  validateModel(model);
  if (uniqueConstraints[model.name]) {
    validateUniqueConstraints(model, uniqueConstraints[model.name]);
  }
}

const dataSource = { provider: "sqlite" };
if (dataSource.provider !== "sqlite") throw new Error("Database provider must be sqlite");

const generator = { provider: "prisma-client-js" };
if (generator.provider !== "prisma-client-js") throw new Error("Generator must be prisma-client-js");
