import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "client/src/components/SubdivisionBuyerReadiness.tsx"), "utf8");

describe("SubdivisionBuyerReadiness", () => {
  it("mantém bloqueio explícito antes do contexto e não revela a existência de clientes", () => {
    expect(source).toContain("!contextReady");
    expect(source).toContain("não há leitura de prontidão nem indicação de existência de clientes");
  });

  it("é somente leitura e não inclui controles materiais", () => {
    expect(source).not.toContain("<button");
    expect(source).not.toContain("onClick");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("useMutation");
    expect(source).not.toContain("input type=\"file\"");
    expect(source).toContain("estado opaco, sem arquivo ou metadado");
    expect(source).toContain("o quadro não decide, classifica risco ou inicia venda");
  });
});
