import { describe, it, expect } from "vitest";
import { ORDER_TRANSITIONS, SHIPMENT_TRANSITIONS, BATCH_TRANSITIONS } from "@/lib/state-machines";

function assertValidStateMachine(machine: Record<string, string[]>, name: string) {
  const states = Object.keys(machine);

  it(`${name}: cada transición apunta a un estado que existe`, () => {
    for (const [from, targets] of Object.entries(machine)) {
      for (const to of targets) {
        expect(states, `${from} → ${to} pero "${to}" no es un estado válido`).toContain(to);
      }
    }
  });

  it(`${name}: no hay auto-transiciones (un estado no se apunta a sí mismo)`, () => {
    for (const [from, targets] of Object.entries(machine)) {
      expect(targets).not.toContain(from);
    }
  });
}

describe("ORDER_TRANSITIONS", () => {
  assertValidStateMachine(ORDER_TRANSITIONS, "ORDER_TRANSITIONS");

  it("Entregado y Cancelado son estados terminales", () => {
    expect(ORDER_TRANSITIONS.Entregado).toEqual([]);
    expect(ORDER_TRANSITIONS.Cancelado).toEqual([]);
  });

  it("se puede cancelar hasta EnProduccion, pero no una vez listo para enviar", () => {
    expect(ORDER_TRANSITIONS.Pendiente).toContain("Cancelado");
    expect(ORDER_TRANSITIONS.Pagado).toContain("Cancelado");
    expect(ORDER_TRANSITIONS.EnProduccion).toContain("Cancelado");
    expect(ORDER_TRANSITIONS.ListoParaEnvio).not.toContain("Cancelado");
  });

  it("no se puede saltar directo de Pendiente a Entregado", () => {
    expect(ORDER_TRANSITIONS.Pendiente).not.toContain("Entregado");
  });

  it("no se puede pasar a EnProduccion sin haber pasado por Pagado", () => {
    expect(ORDER_TRANSITIONS.Pendiente).not.toContain("EnProduccion");
  });
});

describe("SHIPMENT_TRANSITIONS", () => {
  assertValidStateMachine(SHIPMENT_TRANSITIONS, "SHIPMENT_TRANSITIONS");

  it("Entregado y Devuelto son estados terminales", () => {
    expect(SHIPMENT_TRANSITIONS.Entregado).toEqual([]);
    expect(SHIPMENT_TRANSITIONS.Devuelto).toEqual([]);
  });

  it("se puede marcar Devuelto desde cualquier estado no terminal", () => {
    expect(SHIPMENT_TRANSITIONS.Preparando).toContain("Devuelto");
    expect(SHIPMENT_TRANSITIONS.Despachado).toContain("Devuelto");
    expect(SHIPMENT_TRANSITIONS.EnTransito).toContain("Devuelto");
  });
});

describe("BATCH_TRANSITIONS", () => {
  assertValidStateMachine(BATCH_TRANSITIONS, "BATCH_TRANSITIONS");

  it("Recibido y Cancelado son estados terminales", () => {
    expect(BATCH_TRANSITIONS.Recibido).toEqual([]);
    expect(BATCH_TRANSITIONS.Cancelado).toEqual([]);
  });

  it("la secuencia principal va en un solo sentido: Solicitado → EnProgreso → Completado → Recibido", () => {
    expect(BATCH_TRANSITIONS.Solicitado).toContain("EnProgreso");
    expect(BATCH_TRANSITIONS.EnProgreso).toContain("Completado");
    expect(BATCH_TRANSITIONS.Completado).toEqual(["Recibido"]);
  });

  it("se puede cancelar un lote antes de que esté completado", () => {
    expect(BATCH_TRANSITIONS.Solicitado).toContain("Cancelado");
    expect(BATCH_TRANSITIONS.EnProgreso).toContain("Cancelado");
    expect(BATCH_TRANSITIONS.Completado).not.toContain("Cancelado");
  });
});
