import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260908013000_subdivision_internal_receivable_alert_configuration_read_a303.sql"), "utf8");

describe("A303 configuração interna de lembretes", () => {
  it("mantém a leitura contextual, minimizada e restrita ao serviço protegido", () => {
    expect(source).toContain("require_active_subdivision_draft_authority");
    expect(source).toContain("'loteadora'");
    expect(source).toContain("'configuration_exists'");
    expect(source).toContain("revoke all");
    expect(source).toContain("to service_role");
  });
  it("não introduz emissão, contato, banco, baixa ou pagamento", () => {
    for (const forbidden of ["boleto", "cobranca", "bank_issuance", "payment", "baixa"]) expect(source.toLowerCase()).not.toContain(forbidden);
  });
});
