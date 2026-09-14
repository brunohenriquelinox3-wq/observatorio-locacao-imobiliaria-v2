import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "client/src/pages/SubdivisionFoundation.tsx"), "utf8");

describe("Central de Vendas — entrada da venda de lote", () => {
  it("mantém o diretório de clientes e inclui uma ação principal inequívoca para iniciar a venda", () => {
    expect(source).toContain("SubdivisionBuyerClientDirectory");
    expect(source).toContain("Clientes e documentos");
    expect(source).toContain("Nova venda");
    expect(source).toContain("Iniciar nova venda");
    expect(source).toContain('href="/loteadora/vendas"');
  });

  it("comunica a sequência completa e o lote interno automático sem prometer emissão bancária", () => {
    expect(source).toContain("Cadastre uma nova venda de lote.");
    expect(source).toContain("lote interno de parcelas");
    expect(source).toContain("não emite boleto bancário");
    expect(source).toContain("não envia mensagem");
    expect(source).toContain("não acessa banco");
    expect(source).toContain("não dá baixa");
    expect(source).toContain("não registra pagamento");
  });

  it("usa o diretório contextual de Clientes Loteadora no seletor da venda", () => {
    expect(source).toContain("buyers={(saleDirectoryBuyerClients ?? []).map");
    expect(source).toContain("label: client.displayName");
    expect(source).toContain("listDraftBuyerClientDirectory.useQuery(saleBuyerDirectoryQueryInput");
    expect(source).toContain("listDraftBuyerClients.useQuery(context, { enabled: false");
  });
});
