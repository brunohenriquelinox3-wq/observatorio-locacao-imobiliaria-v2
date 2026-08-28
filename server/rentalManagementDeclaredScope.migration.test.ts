import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828004000_rental_management_declared_scope_a11.sql"), "utf8");

describe("A11 rental management declared scope migration", () => {
  it("restricts the scope to a draft management intake and controlled values", () => {
    expect(migration).toContain("RENTAL_MANAGEMENT_INTAKE_REQUIRED");
    expect(migration).toContain("v_journey is distinct from 'management_interest'::public.rental_journey_kind");
    expect(migration).toContain("full_administration_interest");
    expect(migration).toContain("tenant_search_interest");
  });

  it("keeps the declaration contextual, idempotent, redacted and server-only", () => {
    expect(migration).toContain("private.require_rental_pipeline_authority");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("internal_note_present");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("to service_role");
  });
});
