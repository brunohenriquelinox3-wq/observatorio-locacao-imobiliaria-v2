import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("rotas da aplicação", () => {
  it("mantém os caminhos administrativos e operacionais principais registrados", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

    [
      "/entrar",
      "/administracao",
      "/adm",
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
});
