import { describe, expect, it } from "vitest";
import { filterNavigationByAuthorizedModules } from "./dashboardAuthorizedNavigation";

const items = [
  { label: "Plataforma", path: "/administracao" },
  { label: "ADM", path: "/adm" },
  { label: "Loteadora", path: "/loteadora" },
  { label: "Estoque", path: "/estoque-lotes" },
  { label: "Vendas", path: "/vendas-urbanas" },
  { label: "Locação", path: "/locacao" },
];

describe("navegação por módulos autorizados", () => {
  it("preserva a navegação enquanto a disponibilidade não foi resolvida", () => {
    expect(filterNavigationByAuthorizedModules({
      items,
      isAvailabilityResolved: false,
      authorizedModules: { loteadora: false, vendas_urbanas: false, locacao: false },
    })).toEqual(items);
  });

  it("oculta somente módulos sem contexto autorizado e preserva entradas de plataforma", () => {
    expect(filterNavigationByAuthorizedModules({
      items,
      isAvailabilityResolved: true,
      authorizedModules: { loteadora: true, vendas_urbanas: false, locacao: false },
    }).map(item => item.path)).toEqual([
      "/administracao",
      "/adm",
      "/loteadora",
      "/estoque-lotes",
    ]);
  });
});
