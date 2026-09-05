import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "client/src/components/SubdivisionSaleDraftReadiness.tsx"), "utf8");

describe("SubdivisionSaleDraftReadiness", () => {
  it("mantém o bloqueio explícito antes do contexto", () => {
    expect(source).toContain("!contextReady");
    expect(source).toContain("não há leitura de preparação nem indicação de existência de rascunhos internos");
  });

  it("é somente leitura e não introduz ações comerciais ou mutações", () => {
    expect(source).not.toContain("<button");
    expect(source).not.toContain("onClick");
    expect(source).not.toContain("onSubmit");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("useMutation");
    expect(source).toContain("não cria reserva, proposta, contrato ou obrigação financeira");
  });
});
