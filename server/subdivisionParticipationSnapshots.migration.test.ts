import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("A307 — snapshots internos de participação", () => {
  const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/20260908050000_subdivision_participation_sale_snapshots_a307.sql"), "utf8");
  it("congela regras no momento da aprovação e bloqueia distribuição acima da agenda", () => {
    expect(sql).toContain("subdivision_sale_participation_snapshots");
    expect(sql).toContain("subdivision_materialize_sale_participation_snapshot");
    expect(sql).toContain("SUBDIVISION_PARTICIPATION_SNAPSHOT_OVERALLOCATION_DENIED");
    expect(sql).toContain("SUBDIVISION_PARTICIPATION_SNAPSHOT_FULL_ALLOCATION_DENIED");
    expect(sql).toContain("subdivision_approve_sale_case");
    expect(sql).toContain("subdivision_list_internal_participation_projection_summaries");
    expect(sql).not.toMatch(/bank_account|pix_key|payment_provider|transfer\s*\(|payment_status/i);
  });
});
