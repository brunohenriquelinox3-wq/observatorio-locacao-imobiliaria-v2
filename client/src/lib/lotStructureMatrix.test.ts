import { describe, expect, it } from "vitest";
import { buildLotStructureMatrix } from "./lotStructureMatrix";

describe("buildLotStructureMatrix", () => {
  it("ordena os Lotes pelo número e associa apenas estados internos reconhecidos", () => {
    const cells = buildLotStructureMatrix(
      [
        { lotId: "lot-b", blockId: "block-a", lotNumber: 12 },
        { lotId: "lot-a", blockId: "block-a", lotNumber: 2 },
      ],
      [{ lotId: "lot-b", inventoryPhase: "structure_review" }],
    );

    expect(cells.map((cell) => [cell.lotNumber, cell.phase])).toEqual([
      [2, "review_required"],
      [12, "structure_review"],
    ]);
  });

  it("trata estados ausentes ou não reconhecidos como revisão necessária", () => {
    const cells = buildLotStructureMatrix(
      [
        { lotId: "lot-a", blockId: "block-a", lotNumber: 1 },
        { lotId: "lot-b", blockId: "block-a", lotNumber: 2 },
      ],
      [{ lotId: "lot-b", inventoryPhase: "commercial_available" }],
    );

    expect(cells.every((cell) => cell.phase === "review_required")).toBe(true);
  });
});
