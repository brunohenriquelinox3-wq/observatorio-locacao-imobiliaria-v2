import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "client/src/pages/LotInventory.tsx"), "utf8");

describe("LotInventory", () => {
  it("se apresenta como área complementar de Loteamentos com linguagem profissional", () => {
    expect(source).toContain("LOTEAMENTOS · ESTOQUE INTERNO");
    expect(source).toContain("Área complementar de Loteamentos");
    expect(source).toContain("Registros internos em preparação");
    expect(source).toContain("PREPARAÇÃO AVANÇADA");
    expect(source).not.toContain('"Rascunhos internos"');
    expect(source).not.toContain('"RASCUNHOS AVANÇADOS"');
  });

  it("mantém os contratos de leitura e alteração governada", () => {
    expect(source).toContain("isDomainContextReady(context)");
    expect(source).toContain("createDraftLot.useMutation");
    expect(source).toContain("upsertDraftLotInventoryState.useMutation");
    expect(source).toContain("correlationId: crypto.randomUUID()");
  });
});
