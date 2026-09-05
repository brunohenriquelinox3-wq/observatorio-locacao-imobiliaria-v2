import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("área de recuperação de Quadras arquivadas", () => {
  const css = readFileSync(
    new URL("./subdivision-archived-recovery.css", import.meta.url),
    "utf8",
  );

  it("destaca a recuperação e mantém o botão Restaurar como ação principal", () => {
    expect(css).toContain("RECUPERAÇÃO RÁPIDA");
    expect(css).toContain(".subdivision-studio__archived-structure");
    expect(css).toContain(".subdivision-studio__secondary");
    expect(css).toContain("@media (max-width: 780px)");
  });
});
