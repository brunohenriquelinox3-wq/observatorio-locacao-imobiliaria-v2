import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const source = readFileSync(path.resolve(process.cwd(), "client/src/components/SubdivisionSaleCaseDossier.tsx"), "utf8");
describe("painel de dossiê da Central de Vendas", () => {
  it("apresenta somente intenção opaca, upload privado e revisão humana", () => { expect(source).toContain("Dossiê privado e revisão humana"); expect(source).toContain("/api/private/subdivision-sale-case-attachments/"); expect(source).toContain("Confirmar revisão humana"); });
  it("declara que não há conteúdo exposto, comunicação ou movimentação automática", () => { expect(source).toContain("não exibe conteúdo, URL, chave, nome ou download"); expect(source).toContain("não assina, registra, cobra, envia mensagem ou movimenta valores"); });
});
