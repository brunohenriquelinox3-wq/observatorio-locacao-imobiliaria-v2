import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260904143000_urban_development_foundation_a107.sql"), "utf8");
const directDenyMigration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260904144500_urban_development_direct_deny_a107_1.sql"), "utf8");

describe("A107 urban development migration", () => {
  it("models only a minimized non-commercial draft structure", () => {
    expect(migration).toContain("internal_reference text not null");
    expect(migration).toContain("development_kind public.urban_development_kind not null");
    expect(migration).toContain("working_phase public.urban_development_phase not null");
    expect(migration).not.toContain("price");
    expect(migration).not.toContain("contract");
    expect(migration).not.toContain("payment");
  });

  it("preserves contextual authority, idempotency, RLS and redacted audit", () => {
    expect(migration).toContain("private.require_urban_pipeline_authority");
    expect(migration).toContain("correlation_id = p_correlation_id");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("payload_redacted");
    expect(migration).toContain("to service_role");
  });

  it("adds an explicit restrictive denial policy for every direct access path", () => {
    expect(directDenyMigration).toContain("urban_developments_deny_direct_access");
    expect(directDenyMigration).toContain("as restrictive");
    expect(directDenyMigration).toContain("using (false)");
    expect(directDenyMigration).toContain("with check (false)");
  });
});
