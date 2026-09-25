import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "next-auth";
import { requireAdmin, requireCliente } from "@/lib/auth-guard";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));

vi.mock("@/lib/auth", () => ({ auth: authMock }));

function makeSession(overrides: Partial<Session["user"]>): Session {
  return {
    user: { id: "u1", rol: "Cliente", ...overrides },
    expires: new Date(Date.now() + 60_000).toISOString(),
  } as Session;
}

beforeEach(() => {
  authMock.mockReset();
});

describe("requireAdmin", () => {
  it("rechaza cuando no hay sesión", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("No autorizado");
  });

  it("rechaza una sesión con rol vacío (ej. login OAuth sin rol asignado)", async () => {
    authMock.mockResolvedValue(makeSession({ rol: "" }));
    await expect(requireAdmin()).rejects.toThrow("No autorizado");
  });

  it("rechaza una sesión con rol desconocido, aunque no sea 'Cliente'", async () => {
    authMock.mockResolvedValue(makeSession({ rol: "Empleado" }));
    await expect(requireAdmin()).rejects.toThrow("No autorizado");
  });

  it("rechaza explícitamente una sesión de Cliente", async () => {
    authMock.mockResolvedValue(makeSession({ rol: "Cliente" }));
    await expect(requireAdmin()).rejects.toThrow("No autorizado");
  });

  it("acepta una sesión con rol Propietario", async () => {
    const session = makeSession({ rol: "Propietario" });
    authMock.mockResolvedValue(session);
    await expect(requireAdmin()).resolves.toBe(session);
  });
});

describe("requireCliente", () => {
  it("rechaza cuando no hay sesión", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireCliente()).rejects.toThrow();
  });

  it("rechaza una sesión de admin", async () => {
    authMock.mockResolvedValue(makeSession({ rol: "Propietario" }));
    await expect(requireCliente()).rejects.toThrow();
  });

  it("acepta una sesión de Cliente y devuelve su id", async () => {
    authMock.mockResolvedValue(makeSession({ id: "c123", rol: "Cliente" }));
    await expect(requireCliente()).resolves.toBe("c123");
  });
});
