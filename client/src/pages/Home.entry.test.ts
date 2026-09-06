import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const home = readFileSync(resolve(import.meta.dirname, "Home.tsx"), "utf8");
const styles = readFileSync(resolve(import.meta.dirname, "../crm-entry.css"), "utf8");
const overrides = readFileSync(resolve(import.meta.dirname, "../crm-entry-overrides.css"), "utf8");

describe("entrada operacional do CRM", () => {
  it("expõe a hierarquia e todas as colunas na sequência aprovada", () => {
    expect(home).toContain('title: "SUPER ADM"');
    expect(home).toContain('title: "ADM"');
    expect(home).toContain('title: "LOTEAMENTOS"');
    expect(home).toContain('title: "VENDAS URBANAS"');
    expect(home).toContain('title: "LOCAÇÃO"');
    expect(home).toContain("Setores econômicos seguem bloqueados");
  });

  it("apresenta Estoque/Mapa como parte interna de Loteamentos, não como setor independente", () => {
    expect(home).toContain('"Cadastro, matriz e estoque interno"');
    expect(home).not.toContain('"Estoque/Mapa de Lotes"');
  });
  it("usa o layout autenticado e não mantém a estrutura editorial antiga", () => {
    expect(home).toContain("DashboardLayout");
    expect(home).not.toContain("Caderno de Campo Urbano");
    expect(styles).toContain(".crm-entry__grid");
  });
  it("preserva legibilidade do controle de abertura contra regras globais de rodapé", () => {
    expect(home).toContain('import "../crm-entry-overrides.css"');
    expect(overrides).toContain(".crm-entry__column footer");
    expect(overrides).toContain("padding: 0");
    expect(overrides).toContain("background: transparent");
  });
  it("evita a compressão do cabeçalho entre os breakpoints móvel e desktop", () => {
    expect(overrides).toContain("@media (min-width: 761px) and (max-width: 1020px)");
    expect(overrides).toContain("grid-template-columns: 52px minmax(0, 1fr)");
    expect(overrides).toContain("grid-column: 2");
  });
});
