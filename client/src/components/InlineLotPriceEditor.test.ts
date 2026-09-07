import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("InlineLotPriceEditor", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/components/InlineLotPriceEditor.tsx"), "utf8");

  it("usa um identificador contextual exclusivo e mantém o total apenas derivado", () => {
    expect(source).toContain('const editorId = "inline-lot-price-editor-contextual"');
    expect(source).toContain("TOTAL REFERENCIAL PARA CONFERÊNCIA");
    expect(source).toContain("Derivado exclusivamente da área física confirmada");
    expect(source).toContain("O valor interno atual é carregado nesta ficha para edição.");
    expect(source).toContain("Identificação do ajuste");
    expect(source).toContain("Gerada automaticamente para esta atualização");
    expect(source).toContain("formatLotPriceAdjustmentLabel");
    expect(source).not.toContain("Referência da atualização");
  });

  it("mantém a preparação interna governada e sem linguagem comercial", () => {
    expect(source).toContain("Preparar atualização interna");
    expect(source).toContain("exige sessão autenticada, política, contexto, alçada");
    expect(source).toContain("Não é valor contratual, disponibilidade ou lançamento financeiro");
    expect(source).not.toContain("Valor de venda");
  });
});
