import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828003000_rental_management_asset_link_a9.sql"), "utf8");

describe("A9 rental management asset link migration", () => {
  it("restricts links to a draft management intake and a draft Locação asset state", () => {
    expect(migration).toContain("RENTAL_MANAGEMENT_INTAKE_REQUIRED");
    expect(migration).toContain("v_journey is distinct from 'management_interest'::public.rental_journey_kind");
    expect(migration).toContain("module_state.module = 'locacao'::public.operating_module");
    expect(migration).toContain("module_state.lifecycle_state = 'draft'::public.asset_lifecycle_state");
  });

  it("keeps access contextual, idempotent and server-only", () => {
    expect(migration).toContain("private.require_rental_pipeline_authority");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on function public.rental_link_draft_management_asset");
    expect(migration).toContain("to service_role");
  });
});
