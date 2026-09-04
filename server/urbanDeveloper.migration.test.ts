import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260904160000_urban_developer_profiles_a108.sql"), "utf8");

describe("A108 urban developer profiles migration", () => {
  it("reuses a legal-entity Party and keeps commercial fields out", () => {
    expect(migration).toContain("party_id uuid not null references public.party_records");
    expect(migration).toContain("p.kind = 'legal_entity'");
    expect(migration).not.toContain("tax_id");
    expect(migration).not.toContain("price");
    expect(migration).not.toContain("payment");
  });
  it("keeps the structural link contextual, directly denied and audited", () => {
    expect(migration).toContain("private.require_urban_pipeline_authority");
    expect(migration).toContain("urban_developer_profiles_deny_direct_access");
    expect(migration).toContain("urban_development_developer_links_deny_direct_access");
    expect(migration).toContain("payload_redacted");
    expect(migration).toContain("to service_role");
  });
});
