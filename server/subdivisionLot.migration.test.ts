import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828008000_subdivision_lot_foundation_a19.sql"), "utf8");
describe("A19 subdivision lot migration", () => {
  it("enforces the numbered position and its contextual matrix", () => { expect(migration).toContain("lot_number between 1 and 100"); expect(migration).toContain("subdivision_lots_number_unique"); expect(migration).toContain("SUBDIVISION_BLOCK_CONTEXT_DENIED"); });
  it("uses authority, RLS, correlation and server-only RPCs", () => { expect(migration).toContain("private.require_subdivision_draft_authority"); expect(migration).toContain("event.correlation_id = p_correlation_id"); expect(migration).toContain("enable row level security"); expect(migration).toContain("to service_role"); });
});
