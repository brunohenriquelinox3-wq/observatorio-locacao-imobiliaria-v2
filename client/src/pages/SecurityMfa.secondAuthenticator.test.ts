import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("segunda vinculação de autenticador MFA", () => {
  it("permite iniciar uma nova vinculação durante a revalidação sem remover o fator existente", async () => {
    const source = await readFile(resolve(import.meta.dirname, "./SecurityMfa.tsx"), "utf8");
    expect(source).toContain("Vincular outro autenticador");
    expect(source).toContain("sem remover o fator já existente");
    expect(source).toContain('status === "challenge_required"');
    expect(source).toContain('factorType: "totp"');
    expect(source).toContain("friendlyName: `CRM · Autenticador ${crypto.randomUUID()}`");
    expect(source).not.toContain('friendlyName: "CRM · Segurança"');
    expect(source).not.toMatch(/challenge_required[\s\S]{0,900}client\.auth\.mfa\.unenroll/);
  });
});
