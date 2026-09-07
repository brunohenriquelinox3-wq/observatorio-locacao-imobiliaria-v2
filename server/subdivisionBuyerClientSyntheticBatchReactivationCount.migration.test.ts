import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260907204000_subdivision_buyer_client_synthetic_batch_reactivation_count_a289.sql"),
  "utf8",
);

describe("migração A289 da métrica de reativação sintética", () => {
  it("apura o estado arquivado antes do cadastro direto e preserva idempotência auditada", () => {
    expect(migration).toContain("v_direct_registration_was_archived boolean := false");
    expect(migration).toContain("client.state = 'archived'");
    expect(migration).toContain("from public.subdivision_register_client_direct(");
    expect(migration).toContain("if coalesce(v_direct_registration_was_archived, false) then");
    expect(migration).toContain("v_reactivated_count := v_reactivated_count + 1");
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("'reactivated_count', v_reactivated_count");
  });

  it("mantém a autoridade, a deduplicação cadastral e a restrição ao serviço", () => {
    expect(migration).toContain("private.require_subdivision_draft_authority");
    expect(migration).toContain("SUBDIVISION_SYNTHETIC_BATCH_NAME_DOCUMENT_CONFLICT");
    expect(migration).toContain("profile.document_reference = v_document_reference");
    expect(migration).toContain("revoke all on function public.subdivision_import_draft_buyer_clients_synthetic");
    expect(migration).toContain("to service_role");
    expect(migration).not.toContain("contract");
    expect(migration).not.toContain("payment");
    expect(migration).not.toContain("price");
  });
});
