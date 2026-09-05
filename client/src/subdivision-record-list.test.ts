import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("lista lateral compacta de rascunhos", () => {
  const styles = readFileSync(new URL("./subdivision-record-list.css", import.meta.url), "utf8");
  const component = readFileSync(new URL("./components/SubdivisionDevelopmentStudio.tsx", import.meta.url), "utf8");

  it("impede cartões esticados e identifica a finalidade de cada rascunho", () => {
    expect(styles).toContain("align-content: start");
    expect(styles).toContain("grid-auto-rows: max-content");
    expect(component).toContain("Referência");
    expect(component).toContain("Abrir cadastro →");
  });
});
