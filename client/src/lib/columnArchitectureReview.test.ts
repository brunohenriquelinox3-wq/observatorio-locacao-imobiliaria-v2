import { describe, expect, it } from "vitest";
import { columnArchitectureLenses } from "./columnArchitectureReview";

describe("columnArchitectureLenses", () => {
  it("preserva as cinco colunas canônicas com limites de acesso e financeiro", () => {
    expect(columnArchitectureLenses.map((lens) => lens.tab)).toEqual([
      "SUPER ADM",
      "ADM",
      "LOTEADORA",
      "VENDAS URBANAS",
      "LOCAÇÃO",
    ]);
    expect(columnArchitectureLenses.every((lens) => lens.sources.length >= 2)).toBe(true);
    expect(columnArchitectureLenses.find((lens) => lens.key === "super-admin")?.blocked).toContain("JIT");
    expect(columnArchitectureLenses.find((lens) => lens.key === "loteadora")?.promoted.join(" ")).toContain("CPF/CNPJ");
    expect(columnArchitectureLenses.find((lens) => lens.key === "locacao")?.blocked).toContain("boleto");
  });
});
