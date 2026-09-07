import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("SubdivisionPartnerParticipationWorkspace", () => {
  const source = readFileSync(resolve(process.cwd(), "client/src/components/SubdivisionPartnerParticipationWorkspace.tsx"), "utf8");

  it("mantém a jornada de vínculo, versão, escopo e ativação sem linguagem de execução financeira", () => {
    expect(source).toContain("Referência fiscal protegida");
    expect(source).toContain("Versão por loteamento");
    expect(source).toContain("Localizar participante e configurar regra");
    expect(source).toContain("Restringir regra a lotes específicos");
    expect(source).toContain("Ativar versão revisada");
    expect(source).toContain("não um pagamento, split, repasse, baixa ou confirmação de recebimento");
    expect(source).not.toMatch(/boleto bancário real|linha digitável|transferir recursos|conta bancária/i);
  });
});
