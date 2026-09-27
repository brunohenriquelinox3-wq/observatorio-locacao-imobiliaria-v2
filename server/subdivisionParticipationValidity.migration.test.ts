import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  path.resolve(
    process.cwd(),
    "supabase/migrations/20260925270000_subdivision_participation_validity_gate_a388.sql"
  ),
  "utf8"
);

describe("A388 participation validity migration", () => {
  it("inspects the policy anchor and assignment window fail-closed", () => {
    expect(migration).toContain(
      "subdivision_inspect_participation_policy_validity"
    );
    expect(migration).toContain("assignment.starts_at is null");
    expect(migration).toContain("assignment.starts_at::date > v_policy.valid_from");
    expect(migration).toContain("assignment.ends_at::date < v_policy.valid_from");
    expect(migration).toContain("window_check_performed");
  });

  it("enforces the A388 gate in the effective activation signature", () => {
    expect(migration).toContain(
      "SUBDIVISION_PARTICIPATION_VALIDITY_INCOMPLETE"
    );
    expect(migration).toContain(
      "coalesce((v_validity ->> 'validity_state'), 'blocked') <> 'eligible'"
    );
    expect(migration).toContain(
      "subdivision_inspect_participation_policy_composition"
    );
  });

  it("keeps the contract tenant-scoped and redacted", () => {
    expect(migration).toContain("p_organization_id");
    expect(migration).toContain("organization_id = p_organization_id");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
    expect(migration).toContain("revoke all");
    expect(migration).toContain("grant execute");
    expect(migration).not.toMatch(/payment_status|paid_at|received_cents|pix|stripe/i);
    expect(migration).not.toContain("document_reference");
    expect(migration).not.toContain("display_name");
  });

  it("does not add operational DML or a financial settlement state", () => {
    expect(migration).not.toMatch(/insert into public\.(subdivision_sale|subdivision_internal_receivable)/i);
    expect(migration).not.toMatch(/update public\.(subdivision_sale|subdivision_internal_receivable)/i);
    expect(migration).not.toMatch(/create table/i);
    expect(migration).toContain("não cria direito, pagamento ou repasse");
  });
});
