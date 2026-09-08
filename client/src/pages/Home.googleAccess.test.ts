import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(import.meta.dirname, "Home.tsx"), "utf8");

describe("Home — primeiro acesso Google", () => {
  it("orienta a solicitação de vínculo quando a conta autenticada não tem contexto autorizado", () => {
    expect(source).toContain("isContextAvailabilityResolved && !hasAuthorizedWorkContext");
    expect(source).toContain("Seu acesso de trabalho ainda precisa de vínculo interno.");
    expect(source).toContain('href="/acesso-equipe"');
  });

  it("mantém as três consultas de contexto necessárias para a navegação existente", () => {
    expect(source).toContain('{ module: "loteadora" }');
    expect(source).toContain('{ module: "vendas_urbanas" }');
    expect(source).toContain('{ module: "locacao" }');
  });
});
