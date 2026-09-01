import { describe, expect, it } from "vitest";
import { shouldCloseMobileNavigationAfterRouteChange } from "./dashboardNavigationBehavior";

describe("shouldCloseMobileNavigationAfterRouteChange", () => {
  it("fecha apenas a navegação móvel após a escolha de rota", () => {
    expect(shouldCloseMobileNavigationAfterRouteChange(true)).toBe(true);
    expect(shouldCloseMobileNavigationAfterRouteChange(false)).toBe(false);
  });
});
