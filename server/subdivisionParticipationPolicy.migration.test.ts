import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("A306 — políticas internas de participação", () => {
  const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/20260908040000_subdivision_partner_participation_policies_a306.sql"), "utf8");
  it("mantém versões, regras, escopo de lote e busca protegida sem operações financeiras", () => {
    expect(sql).toContain("subdivision_participation_policy_versions");
    expect(sql).toContain("subdivision_participation_policy_rules");
    expect(sql).toContain("subdivision_participation_rule_lot_scopes");
    expect(sql).toContain("subdivision_lookup_internal_party_by_fiscal_reference");
    expect(sql).toContain("subdivision_activate_participation_policy_version");
    expect(sql).toContain("require_active_subdivision_draft_authority");
    expect(sql).toContain("security definer");
    expect(sql).not.toMatch(/create.*boleto|bank_account|pix_key|transfer\s*\(|payment_provider|webhook/i);
  });
});
