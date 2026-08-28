import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sql = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828016000_subdivision_sale_draft_work_state_a29.sql"), "utf8");

describe("A29 sale draft work state migration", () => {
  it("keeps the state contextual, idempotent and non-financial", () => {
    expect(sql).toContain("require_subdivision_draft_authority");
    expect(sql).toContain("correlation_id=p_correlation_id");
    expect(sql).toContain("payload_redacted");
    expect(sql).toContain("to service_role");
    expect(sql).toContain("link_review");
    expect(sql).not.toContain("amount");
  });
});
