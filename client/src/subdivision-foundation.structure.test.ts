import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const css = () => readFileSync(path.resolve(process.cwd(), "client/src/subdivision-foundation.css"), "utf8");

describe("responsividade do construtor estrutural", () => {
  it("preserva largura mínima e rolagem horizontal para os módulos", () => {
    const source = css();
    expect(source).toContain("repeat(5, minmax(124px, 1fr))");
    expect(source).toContain("overflow-x: auto");
    expect(source).toContain("min-width: 505px");
  });
});
