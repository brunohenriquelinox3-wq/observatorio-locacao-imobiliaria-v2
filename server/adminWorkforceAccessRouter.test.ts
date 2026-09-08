import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("roteamento do ciclo de equipe", () => {
  it("mantém preparação e aceite atrás de procedures protegidas sem novo desafio durante sessão válida", () => {
    expect(source).toContain("preparePlatformWorkforceAccess: platformActiveProcedure");
    expect(source).toContain("prepareOrganizationWorkforceAccess: protectedProcedure");
    expect(source).toContain("acceptOwnWorkforceAccess: protectedProcedure");
    const acceptStart = source.indexOf("acceptOwnWorkforceAccess: protectedProcedure");
    const organizationStart = source.indexOf("prepareOrganizationWorkforceAccess: protectedProcedure");
    const acceptBlock = source.slice(acceptStart, source.indexOf("listPlatformWorkforceAccessRequests:", acceptStart));
    const organizationBlock = source.slice(organizationStart, source.indexOf("\n  organizationContext:", organizationStart));
    expect(acceptBlock).not.toContain("attestSupabaseMfa");
    expect(organizationBlock).not.toContain("attestSupabaseMfa");
    const platformStart = source.indexOf("preparePlatformWorkforceAccess: platformActiveProcedure");
    const platformBlock = source.slice(platformStart, source.indexOf("listOrganizationWorkforceAccessRequests:", platformStart));
    expect(platformBlock).toContain("attestSupabaseMfa");
  });

  it("não cria endpoint público de delegação", () => {
    const workforceSection = source.slice(source.indexOf("requestOwnWorkforceAccess:"), source.indexOf("}),\n  auth:"));
    expect(workforceSection).not.toContain("publicProcedure");
  });
});
