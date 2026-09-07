import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260907010000_subdivision_buyer_client_profiles_a279.sql"), "utf8");
const profileTable = migration.slice(
  migration.indexOf("create table public.subdivision_buyer_client_profiles"),
  migration.indexOf("create index subdivision_buyer_client_profiles_context_lookup"),
);

describe("A279 subdivision buyer client profile migration", () => {
  it("keeps the profile additive, contextual, and free of commercial or financial fields", () => {
    expect(profileTable).toContain("buyer_client_id");
    expect(profileTable).toContain("registration_state");
    expect(profileTable).toContain("representation_state");
    expect(profileTable).toMatch(/foreign key \(buyer_client_id, organization_id\)/);
    expect(profileTable).not.toMatch(/\b(income|credit|score|financing|sale|lot|price|proposal|contract|registry|billing|payment|transfer)\b/i);
  });

  it("requires authority, contextual links, idempotency, redacted audit, RLS, and server-only execution", () => {
    expect(migration).toContain("private.require_subdivision_draft_authority");
    expect(migration).toContain("buyer.id = p_buyer_client_id");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("payload_redacted");
    expect(migration).toContain("security definer set search_path = ''");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("to service_role");
  });

  it("uses requirements and contact preferences without document content or generic consent", () => {
    expect(migration).toContain("subdivision_buyer_client_requirements");
    expect(migration).toContain("subdivision_buyer_client_contact_preferences");
    expect(migration).toContain("'service_contact', 'marketing_contact'");
    expect(migration).not.toMatch(/generic_consent|file_bytes|storage_key|document_url|attachment_content/i);
  });
});
