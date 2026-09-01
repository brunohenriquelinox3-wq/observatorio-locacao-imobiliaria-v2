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
      ["operation", ["/loteadora", "/vendas-urbanas", "/locacao"]],
      ["foundation", ["/cadastro-base", "/ativos-urbanos"]],
    ]);
  });

  it("mantém rotas não catalogadas no grupo operacional", () => {
    const groups = groupDashboardNavigation([{ path: "/outro", label: "Outro" }]);

    expect(groups).toEqual([{ id: "operation", label: "Operação", items: [{ path: "/outro", label: "Outro" }] }]);
  });
});
