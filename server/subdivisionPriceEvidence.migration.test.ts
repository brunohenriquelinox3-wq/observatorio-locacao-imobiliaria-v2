import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(resolve(process.cwd(), "supabase/migrations/20260907108000_subdivision_price_evidence_links_a242.sql"), "utf8");

describe("A242 price evidence migration", () => {
  it("stores opaque links with explicit RLS denial and service-only functions", () => {
    expect(migration).toContain("create table public.subdivision_price_evidence_links");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("subdivision_price_evidence_deny_anon");
    expect(migration).toContain("subdivision_price_evidence_deny_authenticated");
    expect(migration).toContain("attachment_id uuid not null references public.subdivision_development_attachments");
    expect(migration).not.toMatch(/\bstorage_key\b/);
    expect(migration).toContain("revoke all on table public.subdivision_price_evidence_links");
    expect(migration).toContain("grant execute on function public.subdivision_link_price_evidence_v1");
    expect(migration).toContain("to service_role");
  });

  it("requires recorded attachments, protected subject resolution and logical archive", () => {
    expect(migration).toContain("PRICE_EVIDENCE_ATTACHMENT_DENIED");
    expect(migration).toContain("PRICE_EVIDENCE_SUBJECT_DENIED");
    expect(migration).toContain("attachment_state = 'recorded'");
    expect(migration).toContain("link_state = 'archived'");
    expect(migration).toContain("pg_advisory_xact_lock");
    expect(migration).toContain("payload_redacted");
  });
});
