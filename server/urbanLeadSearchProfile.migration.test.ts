import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828005000_urban_lead_search_profile_a13.sql"), "utf8");

describe("A13 urban lead search profile migration", () => {
  it("restricts the profile to a draft search-profile lead and bounded distinct asset kinds", () => {
    expect(migration).toContain("URBAN_SEARCH_PROFILE_INTEREST_REQUIRED");
    expect(migration).toContain("v_interest is distinct from 'search_profile'");
    expect(migration).toContain("URBAN_SEARCH_PROFILE_KINDS_DENIED");
    expect(migration).toContain("cardinality(p_accepted_asset_kinds) not between 1 and 7");
  });

  it("keeps profile access contextual, idempotent, redacted and server-only", () => {
    expect(migration).toContain("private.require_urban_pipeline_authority");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("preference_present");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("to service_role");
  });
});
