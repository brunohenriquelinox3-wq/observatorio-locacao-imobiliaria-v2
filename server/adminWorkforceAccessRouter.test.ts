import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("roteamento do ciclo de equipe", () => {
  it("mantém preparação e aceite atrás de procedures protegidas e atestação MFA", () => {
    expect(source).toContain("preparePlatformWorkforceAccess: platformActiveProcedure");
    expect(source).toContain("prepareOrganizationWorkforceAccess: protectedProcedure");
    expect(source).toContain("acceptOwnWorkforceAccess: protectedProcedure");
    expect(source).toContain('attestation.assuranceLevel !== "aal2"');
    expect(source).toContain('attestation.method !== "totp"');
    expect(source).toContain("ADMIN_COMMAND_PRECONDITIONS_UNMET");
  });

  it("não cria endpoint público de delegação", () => {
    const workforceSection = source.slice(source.indexOf("requestOwnWorkforceAccess:"), source.indexOf("}),\n  auth:"));
    expect(workforceSection).not.toContain("publicProcedure");
  });
});
