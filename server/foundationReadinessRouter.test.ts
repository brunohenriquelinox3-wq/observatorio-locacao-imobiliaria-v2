import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./foundationReadiness", () => ({
  getFoundationReadiness: vi.fn(async () => ({
    environment: "development",
    directBrowserAccess: "denied",
    commandMode: "blocked",
    counts: { organizations: 0, principals: 0, grants: 0, auditEvents: 0 },
  })),
}));

import { appRouter } from "./routers";

function createContext(role: "admin" | "user"): TrpcContext {
  const now = new Date();
  return {
    user: {
      id: 1,
      openId: `test-${role}`,
      name: "Test User",
      email: null,
      loginMethod: "test",
      role,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    },
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("foundation.readiness", () => {
  it("permite ao administrador ler somente métricas agregadas e o estado bloqueado", async () => {
    const result = await appRouter.createCaller(createContext("admin")).foundation.readiness();

    expect(result).toEqual({
      environment: "development",
      directBrowserAccess: "denied",
      commandMode: "blocked",
      counts: { organizations: 0, principals: 0, grants: 0, auditEvents: 0 },
    });
    expect(result).not.toHaveProperty("rows");
    expect(result).not.toHaveProperty("identifiers");
  });

  it("nega a mesma leitura a usuário sem papel administrativo", async () => {
    await expect(
      appRouter.createCaller(createContext("user")).foundation.readiness(),
    ).rejects.toMatchObject({ code: "FORBIDDEN", message: "You do not have required permission (10002)" });
  });
});
