import { describe, expect, it } from "vitest";
import { filterNavigationByAuthorizedModules } from "./dashboardAuthorizedNavigation";

const items = [
  { label: "Plataforma", path: "/administracao" },
  { label: "ADM", path: "/adm" },
  { label: "Loteadora", path: "/loteadora" },
  { label: "Estoque", path: "/estoque-lotes" },
  { label: "Vendas", path: "/vendas-urbanas" },
  { label: "Imóveis urbanos", path: "/vendas-urbanas/imoveis-proprietarios" },
  { label: "Agenda urbana", path: "/vendas-urbanas/agenda" },
  { label: "Locação", path: "/locacao" },
  { label: "Imóveis de locação", path: "/locacao/imoveis-proprietarios" },
  { label: "Agenda de locação", path: "/locacao/agenda" },
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

  it("mantém os setores de uma coluna somente quando o módulo correspondente está autorizado", () => {
    expect(filterNavigationByAuthorizedModules({
      items,
      isAvailabilityResolved: true,
      authorizedModules: { loteadora: false, vendas_urbanas: true, locacao: false },
    }).map(item => item.path)).toEqual([
      "/administracao",
      "/adm",
      "/vendas-urbanas",
      "/vendas-urbanas/imoveis-proprietarios",
      "/vendas-urbanas/agenda",
    ]);
  });
});
