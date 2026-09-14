import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("apresentação de referências internas em Loteamentos", () => {
  const studio = readFileSync(resolve(process.cwd(), "client/src/components/SubdivisionDevelopmentStudio.tsx"), "utf8");
  const editor = readFileSync(resolve(process.cwd(), "client/src/components/InlineLotPriceEditor.tsx"), "utf8");
  const foundation = readFileSync(resolve(process.cwd(), "client/src/pages/SubdivisionFoundation.tsx"), "utf8");
  const preparation = readFileSync(resolve(process.cwd(), "client/src/components/SubdivisionPreparationProfile.tsx"), "utf8");

  it("gera identificadores técnicos únicos sem solicitar sua digitação ao operador", () => {
    expect(studio).toContain('createAutomaticTechnicalReference("PC_AJUSTE")');
    expect(studio).toContain('createAutomaticTechnicalReference("PB_CORRECAO")');
    expect(studio).not.toContain('<label>Referência interna<input value={priceConditionDraft.conditionReference}');
    expect(editor).not.toContain('input value={draft.conditionReference}');
  });

  it("oferece somente rótulos curtos e explicação operacional nos editores", () => {
    expect(editor).toContain("Identificação do ajuste");
    expect(editor).toContain("Gerada automaticamente para esta atualização");
    expect(studio).toContain("Identificação do ajuste");
    expect(studio).toContain("O código técnico permanece nos controles internos");
    expect(studio).toContain('placeholder="Buscar loteamento"');
    expect(studio).toContain("Identificação interna preservada");
    expect(studio).not.toContain("<small><b>Referência</b>{development.internalReference}</small>");
  });

  it("aplica o padrão curto também aos seletores de cadastro e preparação", () => {
    expect(foundation).toContain("formatSubdivisionDevelopmentLabel(index, development.displayName, development.internalReference)");
    expect(preparation).toContain("formatSubdivisionDevelopmentLabel(index, development.displayName, development.internalReference)");
    expect(foundation).not.toContain(">{development.internalReference}</option>");
    expect(preparation).not.toContain(">{development.internalReference}</option>");
  });
});
