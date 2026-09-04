import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "UrbanDevelopmentWorkspace.tsx"), "utf8");

describe("UrbanDevelopmentWorkspace messaging", () => {
  it("describes construtora and tower/block as available isolated flows", () => {
    expect(source).toContain("A construtora e a estrutura de torre ou bloco são fluxos separados e autorizados");
    expect(source).toContain("Unidades e comercialização permanecem fora deste setor");
  });
  it("does not retain the outdated future-flow statement", () => {
    expect(source).not.toContain("A associação de construtora, torres e unidades será um fluxo posterior");
  });
});
