import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828007000_subdivision_development_foundation_a17.sql"), "utf8");
const developmentTable = migration.slice(
  migration.indexOf("create table public.subdivision_developments"),
  migration.indexOf("create index subdivision_developments_context_lookup"),
);

describe("A17 subdivision development migration", () => {
  it("keeps the draft subdivision record minimal and contextual", () => {
    expect(migration).toContain("SUBDIVISION_MODULE_DENIED");
    expect(migration).toContain("p_module <> 'loteadora'::public.operating_module");
    expect(migration).toContain("internal_reference text not null check");
    expect(migration).toContain("preliminary_reference");
    expect(developmentTable).not.toMatch(/\b(address|cep|matricula|price|contract|financial)\b/i);
  });

  it("requires authority and keeps mutation and reading server-only", () => {
    expect(migration).toContain("private.require_domain_draft_authority");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("internal_reference_present");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("to service_role");
  });
});
