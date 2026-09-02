import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("rotas da aplicação", () => {
  it("mantém os caminhos administrativos e operacionais principais registrados", () => {
    const appSource = readFileSync(resolve(process.cwd(), "client/src/App.tsx"), "utf8");

    [
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
      "/locacao",
    ].forEach((path) => {
      expect(appSource).toContain(`path={"${path}"}`);
    });
  });
});
