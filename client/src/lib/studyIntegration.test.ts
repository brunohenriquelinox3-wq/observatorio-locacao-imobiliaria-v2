import { describe, expect, it } from "vitest";
import { integrationBenefits, integrationLenses } from "./studyIntegration";

describe("integração de estudos de pagamentos e ativos", () => {
  it("mantém as três lentes auditadas com chaves exclusivas e fontes seguras", () => {
    expect(integrationLenses).toHaveLength(3);
    expect(new Set(integrationLenses.map((lens) => lens.key)).size).toBe(3);
    expect(integrationLenses.every((lens) => lens.sources.length >= 2)).toBe(true);
    expect(integrationLenses.flatMap((lens) => lens.sources).every((source) => source.href.startsWith("https://"))).toBe(true);
  });

  it("preserva os benefícios obrigatórios do observatório na lâmina integrada", () => {
    expect(integrationBenefits).toEqual([
      "explorar os dados de forma mais intuitiva",
      "entender melhor as tendências",
      "salvar ou compartilhar facilmente",
    ]);
  });
});
