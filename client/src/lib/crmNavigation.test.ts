import { describe, expect, it } from "vitest";
import { crmNavigationItems } from "./crmNavigation";

describe("navegação setorial do CRM", () => {
  it("mantém a ordem global e as sequências de setores aprovadas", () => {
    expect(crmNavigationItems.map((item) => item.path)).toEqual([
      "/administracao", "/adm",
      "/loteadora", "/estoque-lotes", "/loteadora/clientes", "/loteadora/socios-parceiros", "/loteadora/vendas", "/loteadora/financeiro",
      "/vendas-urbanas", "/vendas-urbanas/imoveis-proprietarios", "/vendas-urbanas/empreendimentos", "/vendas-urbanas/agenda", "/vendas-urbanas/perfil-busca", "/vendas-urbanas/propostas", "/vendas-urbanas/financeiro",
      "/locacao", "/locacao/imoveis-proprietarios", "/locacao/perfil-busca", "/locacao/agenda", "/locacao/administracao", "/locacao/contratos", "/locacao/financeiro",
      "/cadastro-base", "/ativos-urbanos",
    ]);
  });

  it("mantém as áreas econômicas e contratuais bloqueadas", () => {
    expect(crmNavigationItems.filter((item) => item.path.endsWith("/financeiro") || item.path.endsWith("/propostas") || item.path.endsWith("/contratos")).every((item) => item.disabled)).toBe(true);
  });
});
