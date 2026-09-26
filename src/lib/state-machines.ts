import { EstadoPedido, EstadoEnvio, EstadoLote } from "@prisma/client";

export const ORDER_TRANSITIONS: Record<EstadoPedido, EstadoPedido[]> = {
  Pendiente: ["Pagado", "Cancelado"],
  Pagado: ["EnProduccion", "Cancelado"],
  EnProduccion: ["ListoParaEnvio", "Cancelado"],
  ListoParaEnvio: ["Enviado"],
  Enviado: ["Entregado"],
  Entregado: [],
  Cancelado: [],
};

export const SHIPMENT_TRANSITIONS: Record<EstadoEnvio, EstadoEnvio[]> = {
  Preparando: ["Despachado", "Devuelto"],
  Despachado: ["EnTransito", "Devuelto"],
  EnTransito: ["Entregado", "Devuelto"],
  Entregado: [],
  Devuelto: [],
};

export const BATCH_TRANSITIONS: Record<EstadoLote, EstadoLote[]> = {
  Solicitado: ["EnProgreso", "Cancelado"],
  EnProgreso: ["Completado", "Cancelado"],
  Completado: ["Recibido"],
  Recibido: [],
  Cancelado: [],
};
