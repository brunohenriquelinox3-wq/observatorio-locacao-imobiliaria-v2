import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  path.resolve(
    process.cwd(),
    "supabase/migrations/20260925280000_subdivision_participation_snapshot_temporal_lineage_a389.sql",
  ),
  "utf8",
);

describe("A389 — lineage temporal de participante por venda", () => {
  it("cria uma prova imutável por regra do snapshot, isolada por tenant", () => {
    expect(migration).toContain(
      "subdivision_sale_participation_snapshot_role_validities",
    );
    expect(migration).toContain("snapshot_rule_id uuid not null");
    expect(migration).toContain("party_role_assignment_id uuid not null");
    expect(migration).toContain("effective_on date not null");
    expect(migration).toContain("validity_state = 'eligible'");
    expect(migration).toContain("subdivision_snapshot_role_validities_rule_unique");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on table");
  });

  it("mantém a materialização idempotente e bloqueia uma regra sem janela elegível", () => {
    expect(migration).toContain("if v_existing is not null then");
    expect(migration).toContain("assignment.starts_at::date > current_date");
    expect(migration).toContain("assignment.ends_at is not null and assignment.ends_at::date < current_date");
    expect(migration).toContain("link.development_id <> v_development_id");
    expect(migration).toContain("SUBDIVISION_PARTICIPATION_SNAPSHOT_VALIDITY_INCOMPLETE");
    expect(migration).toContain("v_temporal_eligible_rule_count <> v_rule_count");
    expect(migration).toContain("validity_state\n  )\n  select");
  });

  it("preserva snapshot sem política como não aplicável e sem criar uma prova falsa", () => {
    expect(migration).toContain("'no_active_policy'");
    expect(migration).toContain("when v_snapshot_state = 'no_active_policy' then 'not_applicable'");
    expect(migration).toContain("when v_temporal_verified_rule_count = 0 then 'legacy_unrecorded'");
  });

  it("expõe no detalhe somente estado e contagens agregadas, com fallback indisponível", () => {
    expect(migration).toContain("participant_temporal_lineage_state");
    expect(migration).toContain("participant_temporal_rule_count");
    expect(migration).toContain("participant_temporal_verified_rule_count");
    expect(migration).toContain("'verified_at_snapshot'");
    expect(migration).toContain("'legacy_unrecorded'");
    expect(migration).toContain("'incomplete'");
    expect(migration).toContain("'unavailable'");
  });

  it("não introduz DML operacional de venda nem semântica financeira", () => {
    const executableSql = migration
      .slice(0, migration.indexOf("comment on table"))
      .replace(/--[^\n]*/g, "");
    expect(executableSql).not.toMatch(/update public\.subdivision_sale_cases/i);
    expect(executableSql).not.toMatch(/delete from public\.subdivision_sale/i);
    expect(executableSql).not.toMatch(
      /payment_status|paid_at|received_cents|pix|stripe|linha digitável|split bancário|repasse/i,
    );
    expect(migration).toContain("não cria direito, pagamento ou repasse");
  });
});
