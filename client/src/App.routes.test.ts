import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { crmNavigationItems } from "./lib/crmNavigation";

describe("rotas da aplicação", () => {
  it("mantém os caminhos administrativos e operacionais principais registrados", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

    [
      "/entrar",
      "/administracao",
      "/adm",
      "/importar-clientes",
      "/cadastro-base",
      "/cadastros",
      "/ativos-urbanos",
      "/loteadora",
      "/loteadora/clientes",
      "/loteadora/socios-parceiros",
      "/loteadora/vendas",
      "/loteadora/financeiro",
      "/estoque-lotes",
      "/vendas-urbanas",
      "/vendas-urbanas/imoveis-proprietarios",
      "/vendas-urbanas/empreendimentos",
      "/vendas-urbanas/empreendimentos-construtoras",
      "/vendas-urbanas/agenda",
      "/vendas-urbanas/perfil-busca",
      "/vendas-urbanas/propostas",
      "/vendas-urbanas/propostas-reservas-contratos",
      "/vendas-urbanas/financeiro",
      "/locacao",
      "/locacao/imoveis-proprietarios",
      "/locacao/perfil-busca",
      "/locacao/agenda",
      "/locacao/administracao",
      "/locacao/contratos",
      "/locacao/financeiro",
    ].forEach((path) => {
      expect(appSource).toContain(`path={"${path}"}`);
    });
  });

  it("registra cada caminho canônico exposto na navegação", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

    crmNavigationItems.forEach(({ path }) => {
      expect(appSource).toContain(`path={"${path}"}`);
    });
  });

  it("mantém Estoque/Mapa como rota compatível interna sem expô-lo como setor irmão de Loteamentos", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

    expect(appSource).toContain('path={"/estoque-lotes"}');
    expect(crmNavigationItems.some((item) => item.path === "/estoque-lotes")).toBe(false);
    expect(crmNavigationItems.find((item) => item.path === "/loteadora")?.label).toBe("Loteamentos");
  });
});
