import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260904170000_urban_development_structures_a109.sql"), "utf8");

describe("A109 urban development structures migration", () => {
  it("keeps tower and block structures internal and directly denied", () => {
    expect(migration).toContain("urban_development_structure_kind as enum ('tower', 'block')");
    expect(migration).toContain("urban_development_structures_deny_direct_access");
    expect(migration).toContain("private.require_urban_pipeline_authority");
    expect(migration).toContain("payload_redacted");
  });
  it("does not create unit, inventory, price, contract, or financial fields", () => {
    for (const forbidden of ["unit_id", "inventory", "price", "contract", "payment", "commission"]) expect(migration).not.toContain(forbidden);
  });
});
