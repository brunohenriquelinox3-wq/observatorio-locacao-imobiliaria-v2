import { describe, expect, it } from "vitest";
import { groupDashboardNavigation } from "./dashboardNavigationGroups";

describe("groupDashboardNavigation", () => {
  it("separa plataforma, colunas operacionais e fundações sem alterar a ordem interna", () => {
    const groups = groupDashboardNavigation([
      { path: "/administracao", label: "Central" },
      { path: "/adm", label: "ADM" },
      { path: "/loteadora", label: "Loteadora" },
      { path: "/vendas-urbanas", label: "Vendas" },
      { path: "/locacao", label: "Locação" },
      { path: "/cadastro-base", label: "Cadastros" },
      { path: "/ativos-urbanos", label: "Ativos" },
    ]);

    expect(groups.map((group) => [group.id, group.items.map((item) => item.path)])).toEqual([
      ["platform", ["/administracao", "/adm"]],
      ["loteadora", ["/loteadora"]],
      ["urban_sales", ["/vendas-urbanas"]],
      ["rental", ["/locacao"]],
      ["foundation", ["/cadastro-base", "/ativos-urbanos"]],
    ]);
  });

  it("mantém os setores internos de Loteadora sob a mesma coluna", () => {
    const groups = groupDashboardNavigation([
      { path: "/loteadora", label: "Cadastro de Loteamentos" },
      { path: "/estoque-lotes", label: "Estoque/Mapa de Lotes" },
      { path: "/loteadora/clientes", label: "Clientes Loteadora" },
      { path: "/loteadora/socios-parceiros", label: "Sócios e Parceiros" },
      { path: "/loteadora/financeiro", label: "Financeiro" },
    ]);

    expect(groups).toEqual([
      {
        id: "loteadora",
        label: "Loteadora",
        items: [
          { path: "/loteadora", label: "Cadastro de Loteamentos" },
          { path: "/estoque-lotes", label: "Estoque/Mapa de Lotes" },
          { path: "/loteadora/clientes", label: "Clientes Loteadora" },
          { path: "/loteadora/socios-parceiros", label: "Sócios e Parceiros" },
          { path: "/loteadora/financeiro", label: "Financeiro" },
        ],
      },
    ]);
  });

  it("mantém rotas não catalogadas no grupo operacional", () => {
    const groups = groupDashboardNavigation([{ path: "/outro", label: "Outro" }]);

    expect(groups).toEqual([{ id: "operation", label: "Operação", items: [{ path: "/outro", label: "Outro" }] }]);
  });
});
