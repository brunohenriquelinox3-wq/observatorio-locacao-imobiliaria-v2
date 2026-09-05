import { describe, expect, it } from "vitest";
import { mfaSecurityStatusCopy, resolveMfaSecurityStatus } from "./mfaSecurityState";

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
    expect(resolveMfaSecurityStatus({ hasSession: true, currentLevel: "aal2", nextLevel: "aal2", totpFactorCount: 1 })).toBe("verified");
  });
});
