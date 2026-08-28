import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828003500_rental_tenant_search_profile_a10.sql"), "utf8");

describe("A10 rental tenant search profile migration", () => {
  it("restricts profiles to draft tenant interest and a minimal preference set", () => {
    expect(migration).toContain("RENTAL_TENANT_INTAKE_REQUIRED");
    expect(migration).toContain("v_journey is distinct from 'tenant_interest'::public.rental_journey_kind");
    expect(migration).toContain("cardinality(accepted_asset_kinds) between 1 and 4");
    expect(migration).toContain("Sem endereço, CEP, geolocalização, preço, renda, contato, análise, garantia, contrato ou financeiro.");
  });

  it("keeps the profile contextual, idempotent, redacted and server-only", () => {
    expect(migration).toContain("private.require_rental_pipeline_authority");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("asset_kind_count");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("to service_role");
  });
});
