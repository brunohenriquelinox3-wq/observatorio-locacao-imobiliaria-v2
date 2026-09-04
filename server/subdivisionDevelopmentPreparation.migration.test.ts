import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260904234000_subdivision_development_preparation_profile_a171.sql"), "utf8");
const preparationTable = migration.slice(
  migration.indexOf("create table public.subdivision_development_preparation_profiles"),
  migration.indexOf("create index subdivision_development_preparation_profiles_context_lookup"),
);

describe("A171 subdivision development preparation migration", () => {
  it("keeps preparation states internal, contextual, and free of material fields", () => {
    expect(migration).toContain("create type public.subdivision_planning_state");
    expect(migration).toContain("municipal_preparation_state");
    expect(migration).toContain("registration_preparation_state");
    expect(migration).toContain("implementation_preparation_state");
    expect(preparationTable).toContain("responsible_internal_party_role_id");
    expect(preparationTable).not.toMatch(/\b(address|matricula|document|area|cost|price|contract|reservation|proposal|billing|financial)\b/i);
  });

  it("requires authority, same-development responsibility, idempotency, audit, and server-only access", () => {
    expect(migration).toContain("private.require_subdivision_draft_authority");
    expect(migration).toContain("role_link.development_id = p_development_id");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("payload_redacted");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("to service_role");
  });
});
