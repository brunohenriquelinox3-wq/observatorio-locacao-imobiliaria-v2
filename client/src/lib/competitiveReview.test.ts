import { describe, expect, it } from "vitest";
import { competitiveReviewLenses } from "./competitiveReview";

describe("competitiveReviewLenses", () => {
  it("mantém os cinco ciclos de auditoria com fonte e fronteira explícitas", () => {
    expect(competitiveReviewLenses).toHaveLength(5);
    expect(competitiveReviewLenses.map((lens) => lens.code)).toEqual(["C1", "C2", "C3", "C4", "C5"]);
    expect(competitiveReviewLenses.every((lens) => lens.sources.length >= 2)).toBe(true);
    expect(competitiveReviewLenses.every((lens) => lens.blocked.length > 40)).toBe(true);
  });
});
