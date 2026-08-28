import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sql = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828018000_subdivision_economic_rule_set_a32.sql"), "utf8");

describe("A32 economic rule set migration", () => {
  it("keeps the rule set contextual, versioned and non-monetary", () => {
    expect(sql).toContain("require_subdivision_draft_authority");
    expect(sql).toContain("correlation_id=p_correlation_id");
    expect(sql).toContain("payload_redacted");
    expect(sql).toContain("to service_role");
    expect(sql).toMatch(/draft_internal/);
    expect(sql).not.toMatch(/\b(amount|percentage|installment|payment|billing|payout)\b/i);
  });
});
