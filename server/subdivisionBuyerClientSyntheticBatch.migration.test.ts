import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const migration = readFileSync(
  resolve(process.cwd(), "supabase/migrations/20260907200000_subdivision_buyer_client_synthetic_batch_a287.sql"),
  "utf8",
);

describe("migração A287 de cadastro sintético", () => {
  it("exige autoridade, impõe limites, preserva vazios e audita somente totais", () => {
    expect(migration).toContain("private.require_subdivision_draft_authority");
    expect(migration).toContain("jsonb_array_length(p_rows) < 1 or jsonb_array_length(p_rows) > 200");
    expect(migration).toContain("coalesce(v_primary_phone, v_existing_primary_phone)");
    expect(migration).toContain("coalesce(v_messaging_phone, v_existing_messaging_phone)");
    expect(migration).toContain("'input_count', v_input_count");
    expect(migration).not.toContain("'display_name', v_display_name");
    expect(migration).not.toContain("'document_reference', v_document_reference");
  });

  it("preserva o escopo cadastral e bloqueia execução direta", () => {
    expect(migration).toContain("SUBDIVISION_SYNTHETIC_BATCH_CONTEXT_DENIED");
    expect(migration).toContain("SUBDIVISION_SYNTHETIC_BATCH_NAME_DOCUMENT_CONFLICT");
    expect(migration).toContain("revoke all on function public.subdivision_import_draft_buyer_clients_synthetic");
    expect(migration).toContain("to service_role");
    expect(migration).not.toContain("contract");
    expect(migration).not.toContain("payment");
    expect(migration).not.toContain("price");
  });

  it("deduplica pela referência cadastral e bloqueia colisão entre nome e documento", () => {
    expect(migration).toContain("profile.document_reference = v_document_reference");
    expect(migration).toContain("lower(trim(party.display_name)) = lower(v_display_name)");
    expect(migration).toContain("SUBDIVISION_SYNTHETIC_BATCH_NAME_DOCUMENT_CONFLICT");
  });
});
