import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260925234000_subdivision_sale_case_primary_payer_a385.sql"
  ),
  "utf8"
);

describe("A385 primary payer declaration", () => {
  it("mantém uma única designação tenant-scoped entre proponentes existentes", () => {
    expect(migration).toContain(
      "create table public.subdivision_sale_case_primary_payers"
    );
    expect(migration).toContain(
      "foreign key (sale_case_id, organization_id)"
    );
    expect(migration).toContain(
      "foreign key (organization_id, sale_case_id, buyer_client_id)"
    );
    expect(migration).toContain(
      "subdivision_sale_case_primary_payers_one_per_case"
    );
    expect(migration).toContain("enable row level security");
    expect(migration).toContain(
      "revoke all on table public.subdivision_sale_case_primary_payers"
    );
  });

  it("valida estado, proponente, lock, idempotência e audit redigido", () => {
    expect(migration).toContain("subdivision_set_sale_case_primary_payer");
    expect(migration).toContain("SUBDIVISION_PRIMARY_PAYER_STATE_DENIED");
    expect(migration).toContain("SUBDIVISION_PRIMARY_PAYER_PARTY_DENIED");
    expect(migration).toContain("hashtextextended(");
    expect(migration).toContain("payer_declared");
    expect(migration).toContain("designation_changed");
    expect(migration).toContain("SUBDIVISION_PRIMARY_PAYER_REASSIGN_REQUIRED");
  });

  it("fecha a formalização sem designação e encaminha a única agenda ao núcleo histórico", () => {
    expect(migration).toContain(
      "SUBDIVISION_SALE_FORMALIZATION_PRIMARY_PAYER_REQUIRED"
    );
    expect(migration).toContain("private.subdivision_lock_sale_case_lots");
    expect(migration).toContain("subdivision_formalize_sale_case_legacy_a385");
    expect(migration).toContain("return public.subdivision_formalize_sale_case_legacy_a385");
  });

  it("remove o vínculo antes das partes no purge e expõe somente sinal nominal", () => {
    const payerDelete = migration.indexOf(
      "delete from public.subdivision_sale_case_primary_payers payer"
    );
    const legacyPurge = migration.indexOf(
      "v_result := public.subdivision_delete_archived_sale_case_legacy_a385"
    );
    expect(payerDelete).toBeGreaterThan(-1);
    expect(legacyPurge).toBeGreaterThan(payerDelete);
    expect(migration).toContain("primary_payer_declared boolean := false");
    expect(migration).toContain("'{batch,primary_payer_declared}'");
  });

  it("não introduz estados financeiros externos ou dados pessoais no contrato", () => {
    expect(migration).not.toMatch(/payment_status|paid_at|settled_at|received_cents/i);
    expect(migration).not.toMatch(/cpf|cnpj|document_reference|bank_account/i);
  });
});
