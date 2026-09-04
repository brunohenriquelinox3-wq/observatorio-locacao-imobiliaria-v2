import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const home = readFileSync(resolve(import.meta.dirname, "Home.tsx"), "utf8");
const styles = readFileSync(resolve(import.meta.dirname, "../crm-entry.css"), "utf8");

describe("entrada operacional do CRM", () => {
  it("expõe a hierarquia e todas as colunas na sequência aprovada", () => {
    expect(home).toContain('title: "SUPER ADM"');
    expect(home).toContain('title: "ADM"');
    expect(home).toContain('title: "LOTEADORA"');
    expect(home).toContain('title: "VENDAS URBANAS"');
    expect(home).toContain('title: "LOCAÇÃO"');
    expect(home).toContain("Setores econômicos seguem bloqueados");
  });
  it("usa o layout autenticado e não mantém a estrutura editorial antiga", () => {
    expect(home).toContain("DashboardLayout");
    expect(home).not.toContain("Caderno de Campo Urbano");
    expect(styles).toContain(".crm-entry__grid");
  });
});
