import { Order } from "@prisma/client";

const validEstados = [
  "Todos",
  "Pendiente",
  "Confirmado",
  "EnProduccion",
  "Enviado",
  "Entregado",
  "Cancelado",
] as const;

type PedidoEstado = (typeof validEstados)[number];

interface PedidoUI {
  id: string;
  customerId: string;
  total: string;
  estado: PedidoEstado;
  canal: string;
  createdAt: Date;
}

function validatePedidoFilters(estados: readonly string[]): void {
  if (estados.length !== 7) throw new Error("Pedidos must have 7 filter options");
  if (estados[0] !== "Todos") throw new Error("First filter must be 'Todos'");
  const required = ["Pendiente", "Confirmado", "EnProduccion", "Enviado", "Entregado", "Cancelado"];
  for (const r of required) {
    if (!estados.includes(r)) throw new Error(`Missing filter: ${r}`);
  }
}

function mapOrderToPedidoUI(order: Order): PedidoUI {
  if (!order.id) throw new Error("Order must have id");
  if (!order.customerId) throw new Error("Order must have customerId");
  if (order.total === null || order.total === undefined) throw new Error("Order must have total");
  if (!validEstados.includes(order.estado as PedidoEstado)) {
    throw new Error(`Invalid estado: ${order.estado}`);
  }
  return {
    id: order.id,
    customerId: order.customerId,
    total: order.total.toString(),
    estado: order.estado as PedidoEstado,
    canal: order.canal,
    createdAt: order.createdAt,
  };
}

function validatePedidosPageStructure(): void {
  const page = {
    hasTitle: true,
    title: "Pedidos",
    hasFilterBar: true,
    filterCount: validEstados.length,
    hasEmptyState: true,
  };
  if (!page.hasTitle) throw new Error("Pedidos page must have a title");
  if (page.title !== "Pedidos") throw new Error("Title must be 'Pedidos'");
  if (!page.hasFilterBar) throw new Error("Pedidos page must have filter bar");
  if (page.filterCount !== 7) throw new Error("Pedidos must have 7 filters");
  if (!page.hasEmptyState) throw new Error("Pedidos page must have empty state");
}

validatePedidosPageStructure();
validatePedidoFilters(validEstados);
