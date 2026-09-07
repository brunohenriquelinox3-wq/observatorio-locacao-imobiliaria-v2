import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "client/src/components/SubdivisionBuyerReadiness.tsx"), "utf8");

describe("SubdivisionBuyerReadiness", () => {
  it("mantém bloqueio explícito antes do contexto e não revela a existência de clientes", () => {
    expect(source).toContain("!contextReady");
    expect(source).toContain("não há leitura de prontidão nem indicação de existência de clientes");
  });

  it("expõe um estoque operacional rolável com contatos mínimos e atalho de edição", () => {
    expect(source).toContain("subdivision-buyer-readiness__rows");
    expect(source).toContain("primaryPhone");
    expect(source).toContain("messagingPhone");
    expect(source).toContain("Editar cadastro");
    expect(source).toContain("onOpenProfile");
    expect(source).not.toContain("fetch(");
    expect(source).not.toContain("useMutation");
    expect(source).not.toContain("input type=\"file\"");
    expect(source).toContain("Dados completos, identificação e documentos ficam na ficha privada.");
  });
});
