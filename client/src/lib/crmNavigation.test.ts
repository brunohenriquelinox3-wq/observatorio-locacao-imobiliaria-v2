import { describe, expect, it } from "vitest";
import { crmNavigationItems } from "./crmNavigation";

describe("navegação setorial do CRM", () => {
  it("mantém a ordem global e incorpora Vendas de Lotes à Central de Vendas", () => {
    expect(crmNavigationItems.map((item) => item.path)).toEqual([
      "/administracao", "/adm", "/seguranca-mfa",
      "/loteadora", "/loteadora/clientes", "/loteadora/socios-parceiros", "/loteadora/financeiro", "/loteadora/manual",
      "/vendas-urbanas", "/vendas-urbanas/imoveis-proprietarios", "/vendas-urbanas/empreendimentos", "/vendas-urbanas/agenda", "/vendas-urbanas/perfil-busca", "/vendas-urbanas/propostas", "/vendas-urbanas/financeiro",
      "/locacao", "/locacao/imoveis-proprietarios", "/locacao/perfil-busca", "/locacao/agenda", "/locacao/administracao", "/locacao/contratos", "/locacao/financeiro",
      "/cadastro-base", "/ativos-urbanos",
    ]);
  });

  it("não mantém Vendas de Lotes como entrada lateral, pois a rota é uma jornada compatível da Central", () => {
    expect(crmNavigationItems.some((item) => item.path === "/loteadora/vendas")).toBe(false);
  });

  it("libera apenas o Financeiro interno da Loteadora e mantém os demais setores externos bloqueados", () => {
    expect(crmNavigationItems.find((item) => item.path === "/loteadora/financeiro")?.disabled).not.toBe(true);
    expect(crmNavigationItems.filter((item) => item.path !== "/loteadora/financeiro" && (item.path.endsWith("/financeiro") || item.path.endsWith("/propostas") || item.path.endsWith("/contratos"))).every((item) => item.disabled)).toBe(true);
  });

  it("mantém Estoque/Mapa fora do menu setorial porque é uma rota interna compatível de Loteamentos", () => {
    expect(crmNavigationItems.some((item) => item.path === "/estoque-lotes")).toBe(false);
  });
});
