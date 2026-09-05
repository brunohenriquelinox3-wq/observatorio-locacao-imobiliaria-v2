import { describe, expect, it } from "vitest";
import { hasRecentTotpMfa, mfaSecurityStatusCopy, resolveMfaSecurityStatus } from "./mfaSecurityState";

function tokenWithClaims(claims: Record<string, unknown>) {
  const encode = (value: string) => btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return `${encode('{"alg":"none"}')}.${encode(JSON.stringify(claims))}.signature`;
}

describe("estado de Segurança e MFA", () => {
  it("exige inscrição somente quando a sessão existe e não há fator", () => {
    expect(resolveMfaSecurityStatus({ hasSession: true, currentLevel: "aal1", nextLevel: "aal1", totpFactorCount: 0 })).toBe("enrollment_required");
  });

  it("exige desafio quando há fator TOTP e a sessão não é reforçada", () => {
    expect(resolveMfaSecurityStatus({ hasSession: true, currentLevel: "aal1", nextLevel: "aal2", totpFactorCount: 1 })).toBe("challenge_required");
  });

  it("não trata uma sessão ausente como condição apta a comando", () => {
    expect(resolveMfaSecurityStatus({ hasSession: false, totpFactorCount: 0 })).toBe("unavailable");
    expect(mfaSecurityStatusCopy("unavailable").description).toContain("contexto autorizado");
    expect(mfaSecurityStatusCopy("error").description).toContain("comandos continuam bloqueados");
  });

  it("reconhece somente AAL2 como sessão reforçada", () => {
    expect(resolveMfaSecurityStatus({ hasSession: true, currentLevel: "aal2", nextLevel: "aal2", totpFactorCount: 1, hasRecentTotp: true })).toBe("verified");
  });

  it("exige nova confirmação quando o token AAL2 não contém TOTP recente", () => {
    const now = 2_000_000;
    const staleToken = tokenWithClaims({ aal: "aal2", amr: [{ method: "totp", timestamp: 1_000 }] });

    expect(hasRecentTotpMfa(staleToken, now)).toBe(false);
    expect(resolveMfaSecurityStatus({ hasSession: true, currentLevel: "aal2", nextLevel: "aal2", totpFactorCount: 1, hasRecentTotp: false })).toBe("challenge_required");
  });
});
