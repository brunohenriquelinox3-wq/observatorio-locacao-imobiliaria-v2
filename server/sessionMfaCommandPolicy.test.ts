import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const routerSource = readFileSync(resolve(import.meta.dirname, "routers.ts"), "utf8");
const identitySource = readFileSync(resolve(import.meta.dirname, "supabaseIdentity.ts"), "utf8");

describe("política de MFA no login para comandos autorizados", () => {
  it("valida AAL2/TOTP no token de sessão sem impor limite de recência por operação", () => {
    expect(identitySource).toContain('payload.aal !== "aal2"');
    expect(identitySource).toContain('entry.method === "totp"');
    expect(identitySource).not.toContain("ageMs > 15 * 60_000");
    expect(identitySource).toContain("client.auth.getUser(accessToken)");
  });

  it("mantém o mesmo guarda de sessão nos comandos materiais e protectedProcedure nas rotas", () => {
    expect(routerSource).toContain("async function requireRecentTotpMfa");
    expect(routerSource).toContain("await requireRecentTotpMfa(ctx)");
    expect(routerSource).toContain("createPriceCondition: protectedProcedure");
    expect(routerSource).toContain("upsertDraftLotOperationalProfile: protectedProcedure");
    expect(routerSource).toContain("approvePriceCondition: protectedProcedure");
  });
});
