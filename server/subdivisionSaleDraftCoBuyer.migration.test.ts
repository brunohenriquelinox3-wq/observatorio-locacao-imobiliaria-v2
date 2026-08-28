import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sql = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828017000_subdivision_sale_draft_co_buyer_a30.sql"), "utf8");

describe("A30 sale draft co-buyer migration", () => {
  it("keeps co-buyer links contextual, idempotent and non-financial", () => {
    expect(sql).toContain("require_subdivision_draft_authority");
    expect(sql).toContain("correlation_id=p_correlation_id");
    expect(sql).toContain("SUBDIVISION_SALE_DRAFT_CO_BUYER_CONTEXT_DENIED");
    expect(sql).toContain("payload_redacted");
    expect(sql).toContain("to service_role");
    expect(sql).not.toContain("percentage");
  });
});
