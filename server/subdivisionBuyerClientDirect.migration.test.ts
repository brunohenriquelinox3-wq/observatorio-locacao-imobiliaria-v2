import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260907123000_subdivision_buyer_client_direct_a281.sql"), "utf8");

describe("A281 direct buyer client migration", () => {
  it("creates the direct registration from the canonical Party through role to buyer client", () => {
    expect(migration).toContain("public.party_records");
    expect(migration).toContain("public.party_role_assignments");
    expect(migration).toContain("public.subdivision_buyer_clients");
    expect(migration).toContain("private.require_subdivision_draft_authority");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
  });

  it("keeps direct registration idempotent and audits only redacted facts", () => {
    expect(migration).toContain("lower(trim(party.display_name)) = lower(trim(p_display_name))");
    expect(migration).toContain("display_name_present");
    expect(migration).toContain("party_reused");
    expect(migration).not.toMatch(/payload_redacted.*p_display_name|primary_email|document_reference|file_bytes|document_url/i);
  });

  it("does not add commercial, financial, contractual, or record-registration effects", () => {
    expect(migration).not.toContain("public.subdivision_sale_drafts");
    expect(migration).not.toContain("public.subdivision_economic_rule_sets");
    expect(migration).not.toContain("public.subdivision_contract");
    expect(migration).not.toContain("public.subdivision_payments");
    expect(migration).toContain("security definer set search_path = ''");
    expect(migration).toContain("to service_role");
  });
});
