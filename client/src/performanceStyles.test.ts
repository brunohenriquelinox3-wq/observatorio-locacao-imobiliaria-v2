import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = resolve(import.meta.dirname);
const readSource = (file: string) => readFileSync(resolve(sourceRoot, file), "utf8");

describe("carregamento de estilos por rota", () => {
  it("mantém a entrada livre dos estilos exclusivos de telas preguiçosas", () => {
    const globalStyles = readSource("index.css");

    expect(globalStyles).not.toContain('"./field-notes.css"');
    expect(globalStyles).not.toContain('"./vendas.css"');
    expect(globalStyles).not.toContain('"./vendas-review.css"');
    expect(globalStyles).not.toContain('"./crm.css"');
  });

  it("carrega estilos exclusivos junto das rotas que os utilizam", () => {
    expect(readSource("pages/VendasUrbanas.tsx")).toContain('import "../vendas.css"');
    expect(readSource("pages/VendasUrbanas.tsx")).toContain('import "../vendas-review.css"');
    expect(readSource("pages/CrmStrategy.tsx")).toContain('import "../crm.css"');
  });
});
