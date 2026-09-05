import { describe, expect, it } from "vitest";
import { buildClientImportPreview, normalizeClientImportHeader } from "./clientImportPreview";

describe("prévia local de importação de clientes", () => {
  it("normaliza cabeçalhos em português e aceita a matriz mínima", () => {
    expect(normalizeClientImportHeader("  PERFIL ")).toBe("perfil");
    const preview = buildClientImportPreview([{ Nome: "Cliente de teste", Tipo: "Pessoa física", Perfil: "Cliente" }], ["Nome", "Tipo", "Perfil"]);
    expect(preview.isReady).toBe(true);
    expect(preview.rows[0]).toMatchObject({ displayName: "Cliente de teste", kind: "individual", role: "client", issues: [] });
  });

  it("bloqueia colunas inesperadas e repetições antes de qualquer envio", () => {
    const preview = buildClientImportPreview([{ Nome: "Cliente de teste", Tipo: "Pessoa física", Perfil: "Cliente", CPF: "não aceito" }, { Nome: "cliente de teste", Tipo: "Pessoa física", Perfil: "Cliente", CPF: "não aceito" }], ["Nome", "Tipo", "Perfil", "CPF"]);
    expect(preview.isReady).toBe(false);
    expect(preview.fileIssues.join(" ")).toContain("coluna não permitida");
    expect(preview.rows[1]?.issues.join(" ")).toContain("repetido");
  });
});
