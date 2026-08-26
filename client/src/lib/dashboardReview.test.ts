import { describe, expect, it } from "vitest";
import { dashboardReviewLenses } from "./dashboardReview";

describe("dashboardReviewLenses", () => {
  it("mantém as quatro lentes de métrica, visual, recorte e acesso com provas rastreáveis", () => {
    expect(dashboardReviewLenses.map(item => item.key)).toEqual(["metric", "visual", "interaction", "accessibility"]);
    expect(dashboardReviewLenses.every(item => item.promoted.length === 3)).toBe(true);
    expect(dashboardReviewLenses.every(item => item.sources.length === 2)).toBe(true);
    expect(dashboardReviewLenses.every(item => item.blocked.length > 90)).toBe(true);
  });
});
