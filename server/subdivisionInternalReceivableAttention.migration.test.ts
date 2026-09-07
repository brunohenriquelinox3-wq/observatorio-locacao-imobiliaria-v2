import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907233000_subdivision_internal_receivable_attention_a294.sql"), "utf8");
describe("A294 atenção interna de recebíveis", () => {
  it("limita a leitura a agenda não emitida e impede inferência de pagamento ou comunicação", () => {
    expect(source).toContain("Não infere pagamento, não cobra e não dispara comunicação.");
    expect(source).toContain("bank_issuance_state = 'awaiting_bank_issue'");
    expect(source).not.toContain("payment_status");
    expect(source).not.toContain("notification");
  });
  it("preserva autoridade server-side e execução exclusivamente por serviço", () => {
    expect(source).toContain("private.require_active_subdivision_draft_authority");
    expect(source).toContain("SUBDIVISION_RECEIVABLE_ATTENTION_CONTEXT_DENIED");
    expect(source).toContain("to service_role");
  });
});
