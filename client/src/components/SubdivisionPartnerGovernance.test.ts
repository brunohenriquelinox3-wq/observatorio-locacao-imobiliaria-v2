import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "client/src/components/SubdivisionPartnerGovernance.tsx"), "utf8");

describe("SubdivisionPartnerGovernance", () => {
  it("não revela vínculos antes do contexto e solicita loteamento autorizado", () => {
    expect(source).toContain("!contextReady");
    expect(source).toContain("não há leitura de vínculos internos nem indicação de existência de partes relacionadas");
    expect(source).toContain("Selecione um loteamento autorizado");
  });

  it("permanece somente leitura e não contém controles materiais", () => {
    expect(source).not.toContain("<button");
    expect(source).not.toContain("onClick");
    expect(source).not.toContain("onSubmit");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("useMutation");
    expect(source).toContain("não representa participação, contrato ou recebimento");
  });
});
