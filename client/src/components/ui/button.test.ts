import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const buttonSource = readFileSync(new URL("./button.tsx", import.meta.url), "utf8");

describe("Button bloqueado", () => {
  it("preserva a semântica nativa e comunica visualmente que não há ação disponível", () => {
    expect(buttonSource).toContain("disabled:pointer-events-none");
    expect(buttonSource).toContain("disabled:cursor-not-allowed");
    expect(buttonSource).toContain("disabled:bg-muted");
    expect(buttonSource).toContain("disabled:text-muted-foreground");
    expect(buttonSource).toContain("disabled:opacity-100");
  });
});
