import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260907203000_subdivision_buyer_client_synthetic_reactivation_a288.sql"),
  "utf8",
);

describe("migração A288 de reativação sintética", () => {
  it("só reativa registros arquivados com referência do lote e autoridade contextual", () => {
    expect(migration).toContain("private.require_subdivision_draft_authority");
    expect(migration).toContain("profile.document_reference = v_document_reference");
    expect(migration).toContain("client.state = 'archived'");
    expect(migration).toContain("public.subdivision_restore_client");
    expect(migration).toContain("SUBDIVISION_SYNTHETIC_REACTIVATION_DOCUMENT_DENIED");
  });

  it("permanece idempotente, redigida e exclusiva ao serviço", () => {
    expect(migration).toContain("event.correlation_id = p_correlation_id");
    expect(migration).toContain("'reactivated_count', v_reactivated_count");
    expect(migration).not.toContain("'document_reference', v_document_reference");
    expect(migration).toContain("revoke all on function public.subdivision_reactivate_draft_buyer_clients_synthetic");
    expect(migration).toContain("to service_role");
  });
});
