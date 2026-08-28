import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828004500_urban_lead_asset_link_a12.sql"), "utf8");

describe("A12 urban lead asset link migration", () => {
  it("restricts links to draft urban-asset leads and draft Vendas Urbanas assets", () => {
    expect(migration).toContain("URBAN_ASSET_INTEREST_REQUIRED");
    expect(migration).toContain("v_interest is distinct from 'urban_asset'");
    expect(migration).toContain("module_state.module = 'vendas_urbanas'::public.operating_module");
    expect(migration).toContain("module_state.lifecycle_state = 'draft'::public.asset_lifecycle_state");
  });

  it("keeps links contextual, idempotent and server-only", () => {
    expect(migration).toContain("private.require_urban_pipeline_authority");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("to service_role");
  });
});
