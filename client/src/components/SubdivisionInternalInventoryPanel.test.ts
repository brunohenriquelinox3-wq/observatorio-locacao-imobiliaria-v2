import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("painel de estoque interno por Lote", () => {
  it("mantém a ficha interna separada de disponibilidade e usa contextos protegidos", async () => {
    const source = await readFile(resolve(import.meta.dirname, "./SubdivisionInternalInventoryPanel.tsx"), "utf8");
    expect(source).toContain("listInternalLotInventoryProfiles");
    expect(source).toContain("upsertInternalLotInventoryProfile");
    expect(source).toContain("Sem efeito comercial");
    expect(source).toContain("MFA necessária para salvar");
    expect(source).toContain("profileControlsDisabled");
    expect(source).toContain("crypto.randomUUID()");
    expect(source).toContain("Lote(s) correspondem ao filtro");
    expect(source).not.toContain("Criar mapa público");
  });
});
