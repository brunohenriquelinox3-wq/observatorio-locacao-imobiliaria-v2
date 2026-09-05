import { describe, expect, it } from "vitest";
import { applySubdivisionDraftStructureInputSchema } from "./subdivisionStructureBuilderContracts";

const context = {
  organizationId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  module: "loteadora" as const,
  purposeCode: "CADASTRO_INICIAL",
  developmentId: "7ba7b810-9dad-11d1-80b4-00c04fd430c8",
  correlationId: "9ba7b810-9dad-11d1-80b4-00c04fd430c8",
};

describe("contrato do construtor de estrutura", () => {
  it("aceita Quadras com quantidades diferentes de Lotes", () => {
    expect(applySubdivisionDraftStructureInputSchema.parse({
      ...context,
      replaceExisting: false,
      blocks: [{ blockNumber: 1, lotCount: 15 }, { blockNumber: 2, lotCount: 25 }],
    }).blocks).toEqual([{ blockNumber: 1, lotCount: 15 }, { blockNumber: 2, lotCount: 25 }]);
  });

  it("recusa números de Quadra repetidos e quantidade fora do limite", () => {
    expect(() => applySubdivisionDraftStructureInputSchema.parse({
      ...context,
      replaceExisting: false,
      blocks: [{ blockNumber: 1, lotCount: 15 }, { blockNumber: 1, lotCount: 25 }],
    })).toThrow();
    expect(() => applySubdivisionDraftStructureInputSchema.parse({
      ...context,
      replaceExisting: false,
      blocks: [{ blockNumber: 1, lotCount: 101 }],
    })).toThrow();
  });
});
