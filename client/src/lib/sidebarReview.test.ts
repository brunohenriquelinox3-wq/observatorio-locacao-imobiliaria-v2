import { describe, expect, it } from "vitest";
import { sidebarReviewLenses } from "./sidebarReview";

describe("sidebarReviewLenses", () => {
  it("mantém uma revisão completa de árvore, rota, recolhimento e drawer", () => {
    expect(sidebarReviewLenses.map((lens) => lens.key)).toEqual(["tree", "route", "collapse", "drawer"]);
    expect(sidebarReviewLenses.every((lens) => lens.promoted.length === 3)).toBe(true);
    expect(sidebarReviewLenses.every((lens) => lens.sources.length === 2)).toBe(true);
    expect(sidebarReviewLenses.every((lens) => lens.blocked.length > 50)).toBe(true);
  });
});
