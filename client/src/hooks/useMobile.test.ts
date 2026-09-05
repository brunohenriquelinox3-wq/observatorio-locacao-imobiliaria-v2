import { describe, expect, it } from "vitest";
import { MOBILE_BREAKPOINT } from "./useMobile";

describe("breakpoint de navegação compacta", () => {
  it("inclui tablet para preservar a área de trabalho operacional", () => {
    expect(MOBILE_BREAKPOINT).toBe(1024);
  });
});
