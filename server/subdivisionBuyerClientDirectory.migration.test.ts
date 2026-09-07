import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260907110000_subdivision_buyer_client_directory_a280.sql"), "utf8");
const timelineFunction = migration.slice(
  migration.indexOf("create or replace function public.subdivision_list_draft_buyer_client_timeline"),
  migration.indexOf("revoke all on function public.subdivision_list_draft_buyer_client_directory"),
);

describe("A280 subdivision buyer client directory migration", () => {
  it("keeps list and timeline scoped to the protected contextual buyer client", () => {
    expect(migration).toContain("private.require_subdivision_draft_authority");
    expect(migration).toContain("buyer.organization_id = p_organization_id");
    expect(migration).toContain("role_assignment.module = 'loteadora'");
    expect(migration).toContain("role_assignment.role in ('client', 'buyer')");
    expect(migration).toContain("buyer.id = p_buyer_client_id");
  });

  it("uses bounded searching and a redacted event projection", () => {
    expect(migration).toContain("char_length(trim(p_search_term)) < 2");
    expect(migration).toContain("p_page_size > 25");
    expect(timelineFunction).toContain("p_limit > 50");
    expect(timelineFunction).toContain("case audit.command_name");
    expect(timelineFunction).not.toMatch(/select\s+audit\.payload_redacted|document_reference|primary_email|primary_phone|messaging_phone/i);
  });

  it("does not add commercial, financial, contractual, or document-content fields", () => {
    expect(migration).not.toMatch(/\b(credit|income|score|financing|sale|lot|price|proposal|contract|registry|billing|payment|transfer|file_bytes|document_url)\b/i);
    expect(migration).toContain("security definer set search_path = ''");
    expect(migration).toContain("to service_role");
  });
});
