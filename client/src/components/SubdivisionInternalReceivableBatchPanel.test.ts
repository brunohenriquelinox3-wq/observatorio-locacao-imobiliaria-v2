import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const source = readFileSync(path.resolve(process.cwd(), "client/src/components/SubdivisionInternalReceivableBatchPanel.tsx"), "utf8");
describe("SubdivisionInternalReceivableBatchPanel", () => {
  it("mantém o Financeiro como controle interno de lotes aprovados", () => { expect(source).toContain("Lotes internos de parcelas liberados"); expect(source).toContain("venda aprovada"); expect(source).toContain("cobrança manual pelo operador"); });
  it("declara que não executa integração ou efeito financeiro externo", () => { expect(source).toContain("não emite boleto bancário"); expect(source).toContain("não acessa banco"); expect(source).toContain("não registra pagamento"); });
});
