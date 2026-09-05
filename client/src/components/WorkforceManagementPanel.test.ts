import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(process.cwd(), "client/src/components/WorkforceManagementPanel.tsx"), "utf8");

describe("WorkforceManagementPanel", () => {
  it("separa perfil de trabalho de papel organizacional e limita ADM a operador", () => {
    expect(source).toContain('const profileLabel = { collaborator: "Colaborador", broker: "Corretor" }');
    expect(source).toContain('mode === "organization" ? "operator" : ""');
    expect(source).toContain("ADM não delega ADM nem eleva alçada.");
  });

  it("exige escopo, finalidade, vigência e confirmação humana antes de preparar", () => {
    expect(source).toContain("modules.length === 0 || !expiry || !confirmedOffline");
    expect(source).toContain("Finalidade");
    expect(source).toContain("Vigência explícita");
    expect(source).toContain("Isto não ativa o acesso.");
  });

  it("não expõe atributos identificáveis nem usa integração direta do navegador", () => {
    expect(source).not.toContain('type="email"');
    expect(source).not.toContain('type="password"');
    expect(source).not.toContain("supabase.from");
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).toContain("Não há nome, e-mail, documento ou identificador da pessoa nesta tela.");
  });
});
