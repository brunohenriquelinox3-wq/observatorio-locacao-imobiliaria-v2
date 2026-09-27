import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(
  resolve(
    import.meta.dirname,
    "../supabase/migrations/20260925194000_subdivision_buyer_client_spouse_links_a383.sql"
  ),
  "utf8"
);

describe("A383 spouse link migration", () => {
  it("creates an additive bilateral relationship with context, RLS and audit controls", () => {
    expect(migration).toContain("create table public.subdivision_buyer_client_spouse_links");
    expect(migration).toContain("canonical_order");
    expect(migration).toContain("distinct check");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("private.require_subdivision_draft_authority");
    expect(migration).toContain("private.subdivision_buyer_client_in_context");
    expect(migration).toContain("admin_audit_events");
    expect(migration).toContain("pg_advisory_xact_lock");
  });

  it("uses the existing Central party role and blocks removal during an active sale", () => {
    expect(migration).toContain("subdivision_sale_case_parties");
    expect(migration).toContain("'joint_proponent'");
    expect(migration).toContain("SUBDIVISION_SALE_CASE_SPOUSE_LINK_REQUIRED");
    expect(migration).toContain("SUBDIVISION_SALE_CASE_SPOUSE_PARTY_REQUIRED");
    expect(migration).toContain("SUBDIVISION_BUYER_CLIENT_SPOUSE_ACTIVE_SALE_DENIED");
    expect(migration).toContain("before update of state on public.subdivision_sale_cases");
  });

  it("does not introduce receivables, payment execution or external settlement", () => {
    expect(migration).not.toMatch(/payment_status|paid_at|settled_at|bank_transfer|payment_intent/i);
    expect(migration).toContain("não cria nem altera boleto, cobrança, pagamento, baixa");
  });
});
