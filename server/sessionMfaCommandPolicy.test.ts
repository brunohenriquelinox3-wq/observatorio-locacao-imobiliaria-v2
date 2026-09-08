import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync(resolve(import.meta.dirname, "routers.ts"), "utf8");
const identitySource = readFileSync(resolve(import.meta.dirname, "supabaseIdentity.ts"), "utf8");

describe("política de sessão autenticada para comandos autorizados", () => {
  it("valida AAL2/TOTP no token de sessão sem impor limite de recência por operação", () => {
    expect(identitySource).toContain('payload.aal !== "aal2"');
    expect(identitySource).toContain('entry.method === "totp"');
    expect(identitySource).not.toContain("ageMs > 15 * 60_000");
    expect(identitySource).toContain("client.auth.getUser(accessToken)");
  });

  it("não repete atestação MFA em comandos operacionais depois do login", () => {
    expect(routerSource).not.toContain("async function requireRecentTotpMfa");
    expect(routerSource).not.toContain("async function requireVerifiedAal2Session");
    expect(routerSource).toContain("createPriceCondition: protectedProcedure");
    expect(routerSource).toContain("upsertDraftLotOperationalProfile: protectedProcedure");
    expect(routerSource).toContain("approvePriceCondition: protectedProcedure");
    expect(routerSource).toContain("preparePlatformWorkforceAccess: platformActiveProcedure");
  });
});
