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

  it("mantém módulos sem contexto visíveis, porém bloqueados, e preserva entradas de plataforma", () => {
    const navigation = filterNavigationByAuthorizedModules({
      items,
      isAvailabilityResolved: true,
      authorizedModules: { loteadora: true, vendas_urbanas: false, locacao: false },
    });

    expect(navigation.map(item => item.path)).toEqual([
      "/administracao",
      "/adm",
      "/loteadora",
      "/estoque-lotes",
      "/vendas-urbanas",
      "/vendas-urbanas/imoveis-proprietarios",
      "/vendas-urbanas/agenda",
      "/locacao",
      "/locacao/imoveis-proprietarios",
      "/locacao/agenda",
    ]);
    expect(navigation.filter(item => item.path.startsWith("/vendas-urbanas") || item.path.startsWith("/locacao")).every(item => item.disabled)).toBe(true);
    expect(navigation.filter(item => item.path.startsWith("/loteadora") || item.path === "/estoque-lotes").every(item => !item.disabled)).toBe(true);
  });

  it("mantém os setores de uma coluna somente quando o módulo correspondente está autorizado", () => {
    const navigation = filterNavigationByAuthorizedModules({
      items,
      isAvailabilityResolved: true,
      authorizedModules: { loteadora: false, vendas_urbanas: true, locacao: false },
    });

    expect(navigation.map(item => item.path)).toEqual([
      "/administracao",
      "/adm",
      "/loteadora",
      "/estoque-lotes",
      "/vendas-urbanas",
      "/vendas-urbanas/imoveis-proprietarios",
      "/vendas-urbanas/agenda",
      "/locacao",
      "/locacao/imoveis-proprietarios",
      "/locacao/agenda",
    ]);
    expect(navigation.filter(item => item.path.startsWith("/loteadora") || item.path === "/estoque-lotes" || item.path.startsWith("/locacao")).every(item => item.disabled)).toBe(true);
    expect(navigation.filter(item => item.path.startsWith("/vendas-urbanas")).every(item => !item.disabled)).toBe(true);
  });
});
