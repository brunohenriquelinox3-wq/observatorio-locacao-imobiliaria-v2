import { describe, expect, it } from "vitest";
import { buildPhysicalSourcePreview } from "./subdivisionPhysicalSourcePreview";

describe("prévia física de loteamento", () => {
  it("retém somente Quadra, Lote e Área ao montar a matriz", () => {
    const result = buildPhysicalSourcePreview([
      ["Quadra", "Lote", "Área (m²)", "Cliente", "Valor"],
      [1, 1, 300, "omitido", 1],
      [1, 2, "301,50", "omitido", 2],
      [2, 1, 320, "omitido", 3],
    ]);
    expect(result).toEqual({
      blockCount: 2,
      lotCount: 3,
      areaCoverageCount: 3,
      issues: [],
      blocks: [
        { blockNumber: 1, lots: [{ lotNumber: 1, areaSqm: 300 }, { lotNumber: 2, areaSqm: 301.5 }] },
        { blockNumber: 2, lots: [{ lotNumber: 1, areaSqm: 320 }] },
      ],
    });
  });

  it("aponta duplicidade e não expõe colunas fora da matriz física", () => {
    const result = buildPhysicalSourcePreview([
      ["Quadra", "Lote", "Status"],
      [1, 1, "conteúdo ignorado"],
      [1, 1, "conteúdo ignorado"],
    ]);
    expect(result.blocks).toEqual([{ blockNumber: 1, lots: [{ lotNumber: 1, areaSqm: null }] }]);
    expect(result.issues).toHaveLength(1);
    expect(JSON.stringify(result)).not.toContain("conteúdo ignorado");
  });

  it("recusa fonte sem colunas estruturais obrigatórias", () => {
    expect(() => buildPhysicalSourcePreview([["Nome", "Status"], ["x", "y"]])).toThrow("SUBDIVISION_PHYSICAL_SOURCE_HEADERS_REQUIRED");
  });
});
