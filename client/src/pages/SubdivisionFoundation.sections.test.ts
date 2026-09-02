import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = () => readFileSync(resolve(process.cwd(), "client/src/pages/SubdivisionFoundation.tsx"), "utf8");

describe("setores da coluna Loteadora", () => {
  it("mantém setores independentes e ordenados na navegação contextual", () => {
    const page = source();

    expect(page).toContain('label: "Cadastro de Loteamentos", path: "/loteadora"');
    expect(page).toContain('label: "Estoque/Mapa de Lotes", path: "/estoque-lotes"');
    expect(page).toContain('label: "Clientes Loteadora", path: "/loteadora/clientes"');
    expect(page).toContain('label: "Sócios e Parceiros", path: "/loteadora/socios-parceiros"');
    expect(page).toContain('label: "Financeiro", path: "/loteadora/financeiro", disabled: true');
  });

  it("mantém Financeiro sem consultas ou comandos econômicos enquanto estiver bloqueado", () => {
    const page = source();

    expect(page).toContain('activeSector === "finance"');
    expect(page).toContain("Financeiro ainda não está liberado para desenvolvimento.");
    expect(page).not.toContain("listEconomicRuleSets.useQuery");
    expect(page).not.toContain("createEconomicRuleSet.useMutation");
  });
});
