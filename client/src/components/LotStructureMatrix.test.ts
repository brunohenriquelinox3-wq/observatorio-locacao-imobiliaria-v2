import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "client/src/components/LotStructureMatrix.tsx"), "utf8");

describe("LotStructureMatrix", () => {
  it("mantém bloqueio explícito antes do contexto e da Quadra", () => {
    expect(source).toContain("!contextReady");
    expect(source).toContain("!blockSelected");
    expect(source).toContain("contexto autorizado");
    expect(source).toContain("Quadra matriz");
  });

  it("permanece somente de leitura e exibe somente o estado comercial já aprovado", () => {
    expect(source).not.toContain("<button");
    expect(source).not.toContain("onClick");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("FormData");
    expect(source).toContain("Sem comando por célula");
    expect(source).toContain("somente uma confirmação aprovada pode marcar um lote como vendido");
    expect(source).toContain("Reversão em revisão");
  });

  it("usa um estado profissional de preparação quando não há Lotes devolvidos", () => {
    expect(source).toContain("Nenhum Lote em preparação foi devolvido");
  });
});
