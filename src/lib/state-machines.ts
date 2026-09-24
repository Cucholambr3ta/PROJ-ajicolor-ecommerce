export const ORDER_TRANSITIONS: Record<string, string[]> = {
  Pendiente: ["Confirmado", "Cancelado"],
  Confirmado: ["EnProduccion", "Cancelado"],
  EnProduccion: ["Enviado", "Cancelado"],
  Enviado: ["Entregado"],
  Entregado: [],
  Cancelado: [],
};

export const SHIPMENT_TRANSITIONS: Record<string, string[]> = {
  Preparando: ["Despachado", "Devuelto"],
  Despachado: ["EnTransito", "Devuelto"],
  EnTransito: ["Entregado", "Devuelto"],
  Entregado: [],
  Devuelto: [],
};

export const BATCH_TRANSITIONS: Record<string, string[]> = {
  Solicitado: ["EnProgreso"],
  EnProgreso: ["Completado"],
  Completado: ["Recibido"],
  Recibido: [],
};
