import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907230000_subdivision_sale_contract_preparation_a293.sql"), "utf8");

describe("A293 formalização interna e agenda de parcelas", () => {
  it("mantém contrato e agenda internos fora da emissão, cobrança e pagamento", () => {
    expect(source).toContain("Não emite boleto, não cobra e não recebe pagamento.");
    expect(source).toContain("'awaiting_bank_issue'");
    expect(source).not.toContain("bank_api_key");
    expect(source).not.toContain("boleto_url");
    expect(source).not.toContain("payment_status");
  });

  it("formaliza uma agenda atômica, revisável e consistente com os termos", () => {
    expect(source).toContain("subdivision_sale_contract_preparations_case_unique");
    expect(source).toContain("subdivision_sale_receivable_schedules_item_unique");
    expect(source).toContain("SUBDIVISION_SALE_FORMALIZATION_TOTAL_DENIED");
    expect(source).toContain("generate_series(1, v_terms.installment_count)");
    expect(source).toContain("entry_due_date");
  });

  it("requer autoridade, bloqueia concorrência, é idempotente e audita somente metadados", () => {
    expect(source).toContain("private.require_active_subdivision_draft_authority");
    expect(source).toContain("pg_advisory_xact_lock");
    expect(source).toContain("subdivision_formalize_sale_case");
    expect(source).toContain("payload_redacted");
    expect(source).toContain("scheduled_item_count");
    expect(source).not.toContain("'scheduled_total_cents', v_total");
    expect(source).toContain("to service_role");
  });
});
