import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828007500_subdivision_block_foundation_a18.sql"), "utf8");
const blockTable = migration.slice(
  migration.indexOf("create table public.subdivision_blocks"),
  migration.indexOf("create index subdivision_blocks_context_lookup"),
);

describe("A18 subdivision block migration", () => {
  it("keeps every block numbered, unique and limited to a draft development", () => {
    expect(migration).toContain("block_number between 1 and 999");
    expect(migration).toContain("subdivision_blocks_number_unique");
    expect(migration).toContain("SUBDIVISION_DEVELOPMENT_CONTEXT_DENIED");
    expect(blockTable).not.toMatch(/\b(lot_number|stock|price|partner|client|contract|financial)\b/i);
  });

  it("uses the existing contextual authority and server-only RPCs", () => {
    expect(migration).toContain("private.require_subdivision_draft_authority");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("to service_role");
  });
});
