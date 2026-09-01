import { describe, expect, it } from "vitest";
import { draftBlockSelectionLabel, draftDevelopmentSelectionLabel, draftLotSelectionLabel } from "./lotInventoryContextSelection";

describe("lotInventoryContextSelection", () => {
  it("descreve o loteamento apenas por referência interna e situação de trabalho", () => {
    expect(draftDevelopmentSelectionLabel({ internalReference: "EMP-001", workingPhase: "structuring" })).toBe(
      "EMP-001 · Em estruturação",
    );
  });

  it("mantém a nomenclatura canônica de Quadra e Lote sem expor identificadores técnicos", () => {
    expect(draftBlockSelectionLabel({ blockNumber: 12 })).toBe("Quadra 12");
    expect(draftLotSelectionLabel({ lotNumber: 4 })).toBe("Lote 4");
  });
});
