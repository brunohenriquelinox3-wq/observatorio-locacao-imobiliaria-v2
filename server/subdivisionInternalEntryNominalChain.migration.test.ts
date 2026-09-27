import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  path.resolve(
    process.cwd(),
    "supabase/migrations/20260925250000_subdivision_internal_entry_nominal_chain_a386.sql",
  ),
  "utf8",
);

const compatibilityMigration = readFileSync(
  path.resolve(
    process.cwd(),
    "supabase/migrations/20260925251000_subdivision_internal_entry_nominal_chain_compatibility_a386_1.sql",
  ),
  "utf8",
);

describe("A386 — cadeia nominal da entrada", () => {
  it("cria somente uma função de leitura protegida e privada", () => {
    expect(migration).toContain(
      "subdivision_get_internal_receivable_batch_item_detail_v3",
    );
    expect(migration).toContain("require_active_subdivision_draft_authority");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("revoke all on function");
    expect(migration).toContain("grant execute on function");
    expect(migration).toContain("to service_role");
    expect(migration).not.toMatch(/\b(insert|update|delete)\s+into\b/i);
  });

  it("deriva entrada à vista e parcela da entrada do schedule", () => {
    expect(migration).toContain("v_schedule_kind = 'entry'");
    expect(migration).toContain("v_schedule_kind = 'entry_installment'");
    expect(migration).toContain("entry_cash");
    expect(migration).toContain("entry_installment");
    expect(migration).toContain("nominal_amount_cents");
    expect(migration).toContain("reason_label");
  });

  it("agrega recebedores previstos por papel e bloqueia sobrealocação", () => {
    expect(migration).toContain("projected_amount_cents");
    expect(migration).toContain("projected_item_count");
    expect(migration).toContain("participant_role");
    expect(migration).toContain("v_receiver_total > v_amount_cents");
    expect(migration).toContain("SUBDIVISION_INTERNAL_ENTRY_CHAIN_OVERALLOCATION_DENIED");
    expect(migration).toContain("recipient_chain_state");
  });

  it("preserva pagador apenas como sinal declarado e não como fato financeiro", () => {
    expect(migration).toContain("primary_payer_declared");
    expect(migration).toContain("subdivision_get_internal_receivable_batch_item_detail_v2");
    expect(migration).toMatch(/sem pagamento externo/i);
    expect(migration).not.toMatch(/paymentStatus|paidAt|settledAt|receivedCents/i);
  });

  it("mantém o item legado legível quando o enriquecimento da agenda não estiver disponível", () => {
    expect(compatibilityMigration).toContain("v_result->'item'->>'schedule_kind'");
    expect(compatibilityMigration).toContain("no_active_policy");
    expect(compatibilityMigration).toContain("sem inventar recebedores");
    expect(compatibilityMigration).not.toMatch(/\b(insert|update|delete)\s+into\b/i);
  });
});
