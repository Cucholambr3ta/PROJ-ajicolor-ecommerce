import { PrismaClient } from "@prisma/client";

type MockFunction = (...args: unknown[]) => unknown;

function createMockFunction(): MockFunction {
  const fn: MockFunction & { mock?: { calls: unknown[][] } } = (...args: unknown[]) => {
    fn.mock = fn.mock || { calls: [] };
    fn.mock.calls.push(args);
    return createMockObject();
  };
  return fn;
}

function createMockObject(): Record<string, unknown> {
  return new Proxy(() => createMockObject(), {
    apply(_target, _thisArg, args) {
      return createMockObject();
    },
    get(_target, prop) {
      if (prop === Symbol.toPrimitive) return () => "";
      if (prop === Symbol.iterator) return undefined;
      if (prop === "then") return undefined;
      if (prop === "toJSON") return () => "{}";
      if (typeof prop === "symbol") return undefined;
      return createMockFunction();
    },
  }) as unknown as Record<string, unknown>;
}

export type PrismaMock = PrismaClient;

let prismaMockInstance: PrismaMock | null = null;

export function getPrismaMock(): PrismaMock {
  if (!prismaMockInstance) {
    prismaMockInstance = createMockObject() as unknown as PrismaClient;
  }
  return prismaMockInstance;
}

export function resetPrismaMock(): void {
  prismaMockInstance = createMockObject() as unknown as PrismaClient;
}
