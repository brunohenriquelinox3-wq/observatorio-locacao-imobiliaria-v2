import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("roteamento da importação de clientes", () => {
  it("mantém a importação atrás de procedure protegida e MFA TOTP", () => {
    expect(source).toContain("clientImport: router");
    expect(source).toContain("commit: protectedProcedure");
    expect(source).toContain("clientImportCommitInputSchema");
    expect(source).toContain('attestation.assuranceLevel !== "aal2"');
    expect(source).toContain('attestation.method !== "totp"');
    expect(source).toContain("CLIENT_IMPORT_PRECONDITIONS_UNMET");
  });

  it("não cria endpoint público para importação", () => {
    const importSection = source.slice(source.indexOf("clientImport: router"), source.indexOf("domainFoundation: router"));
    expect(importSection).not.toContain("publicProcedure");
  });
});
