import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const subdivisionStyles = readFileSync(new URL("./subdivision-foundation.css", import.meta.url), "utf8");
const inventoryStyles = readFileSync(new URL("./lot-inventory.css", import.meta.url), "utf8");

describe("ações bloqueadas de Loteadora", () => {
  it("mantém a semântica visual explícita nas superfícies setoriais", () => {
    for (const styles of [subdivisionStyles, inventoryStyles]) {
      expect(styles).toContain("cursor: not-allowed");
      expect(styles).toContain("background: #f2f6f6");
      expect(styles).toContain("color: #567076");
      expect(styles).toContain("opacity: 1");
    }
  });
});
