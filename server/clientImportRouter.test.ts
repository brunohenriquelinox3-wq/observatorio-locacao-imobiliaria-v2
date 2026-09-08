import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("roteamento da importação de clientes", () => {
  it("mantém a importação atrás de procedure protegida sem MFA repetido", () => {
    expect(source).toContain("clientImport: router");
    expect(source).toContain("commit: protectedProcedure");
    expect(source).toContain("clientImportCommitInputSchema");
    const importSection = source.slice(source.indexOf("clientImport: router"), source.indexOf("domainFoundation: router"));
    expect(importSection).toContain("commitClientImport(ctx.supabaseSubjectId ?? undefined, input)");
    expect(importSection).not.toContain("attestSupabaseMfa");
  });

  it("não cria endpoint público para importação", () => {
    const importSection = source.slice(source.indexOf("clientImport: router"), source.indexOf("domainFoundation: router"));
    expect(importSection).not.toContain("publicProcedure");
  });
});
