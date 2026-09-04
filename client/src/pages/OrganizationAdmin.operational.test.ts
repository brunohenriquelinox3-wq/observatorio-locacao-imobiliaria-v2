import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(import.meta.dirname, "OrganizationAdmin.tsx"), "utf8");
const styles = readFileSync(resolve(import.meta.dirname, "../organization-admin.css"), "utf8");

describe("Painel ADM operacional", () => {
  it("mantém as três colunas na ordem aprovada e a subordinação ao SUPER ADM", () => {
    expect(page.indexOf('title: "Loteadora"')).toBeLessThan(page.indexOf('title: "Vendas Urbanas"'));
    expect(page.indexOf('title: "Vendas Urbanas"')).toBeLessThan(page.indexOf('title: "Locação"'));
    expect(page).toContain("ADM ORGANIZACIONAL · ABAIXO DO SUPER ADM");
  });
  it("mantém a apresentação operacional compacta e o bloqueio sem contexto", () => {
    expect(styles).toContain(".organization-admin__commandbar");
    expect(styles).not.toContain("Georgia,serif");
    expect(page).toContain("Contextos indisponíveis continuam visíveis e bloqueados");
  });
});
