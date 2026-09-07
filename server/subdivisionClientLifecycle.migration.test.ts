import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260907160000_subdivision_client_profile_and_lifecycle_a282.sql"), "utf8");

describe("A282 protected client lifecycle migration", () => {
  it("archives instead of deleting and preserves contextual authorization", () => {
    expect(migration).toContain("state = 'archived'");
    expect(migration).toContain("subdivision_restore_client");
    expect(migration).toContain("require_subdivision_draft_authority");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).not.toMatch(/delete\s+from\s+public\.subdivision_buyer_clients/i);
  });

  it("retains contact and document protection without creating commercial fields", () => {
    expect(migration).toContain("identity_document_reference");
    expect(migration).toContain("primary_email");
    expect(migration).toContain("messaging_phone");
    expect(migration).not.toMatch(/\b(credit|financing|installment|payment|contract)\b/i);
  });
});
