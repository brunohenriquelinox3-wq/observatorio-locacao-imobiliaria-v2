import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("rota compatível de Estoque/Mapa", () => {
  it("reconhece a área como interna de Loteamentos e preserva retorno à jornada principal", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/LotInventory.tsx"), "utf8");

    expect(source).toContain("LOTEAMENTOS · ÁREA INTERNA");
    expect(source).toContain("Mapa interno de Loteamentos");
    expect(source).toContain('href="/loteadora"');
    expect(source).toContain("Voltar a Loteamentos");
    expect(source).not.toContain("Acessar Estoque e Mapa");
  });
});
