import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260925230000_subdivision_sale_case_multiple_lots_a384.sql"
  ),
  "utf8"
);
const stateSync = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260925231000_subdivision_sale_case_multiple_lots_state_sync_a384_1.sql"
  ),
  "utf8"
);
const transition = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260925232000_subdivision_sale_case_multiple_lots_transition_wrappers_a384_2.sql"
  ),
  "utf8"
);
const participation = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260925233000_subdivision_sale_case_multiple_lots_participation_a384_3.sql"
  ),
  "utf8"
);

describe("A384 multiple sale lots", () => {
  it("mantém lote principal legado, tenant FKs, unique e limite seguro", () => {
    expect(migration).toContain("create table public.subdivision_sale_case_lots");
    expect(migration).toContain("foreign key (sale_case_id, organization_id)");
    expect(migration).toContain("foreign key (lot_id, organization_id)");
    expect(migration).toContain("unique (organization_id, sale_case_id, lot_id)");
    expect(migration).toContain("lot_position between 1 and 64");
    expect(migration).toContain("enable row level security");
    expect(migration).toContain("revoke all on table public.subdivision_sale_case_lots");
    expect(migration).toContain("subdivision_sale_case_lots_one_primary");
  });

  it("fecha abertura com conjunto não vazio, mesma organização/empreendimento, locks e idempotência", () => {
    expect(migration).toContain("subdivision_open_sale_case_multi");
    expect(migration).toContain("SUBDIVISION_SALE_CASE_LOT_COUNT_DENIED");
    expect(migration).toContain("SUBDIVISION_SALE_CASE_LOT_DUPLICATE");
    expect(migration).toContain("SUBDIVISION_SALE_CASE_DEVELOPMENT_MISMATCH");
    expect(migration).toContain("hashtextextended(p_organization_id::text||':'||v_lot_id::text");
    expect(migration).toContain("SUBDIVISION_SALE_CASE_CORRELATION_CONFLICT");
    expect(migration).toContain("subdivision_open_sale_case_multi");
    expect(migration).toContain("subdivision_open_sale_case(");
  });

  it("expõe lineage físico sem IDs técnicos e preserva uma única agenda nominal", () => {
    expect(migration).toContain("physical_lot_count integer");
    expect(migration).toContain("physical_lots jsonb");
    expect(migration).toContain("'development_reference'");
    expect(migration).toContain("'block_number'");
    expect(migration).toContain("'lot_number'");
    expect(migration).toContain("sale_case.lot_id");
    expect(migration).toContain("sem duplicar agenda, itens nominais");
    expect(migration).not.toContain("payment_status");
    expect(migration).not.toContain("paid_at");
  });

  it("propaga estados comerciais e serializa archive/restore/purge sem liberar lote secundário", () => {
    expect(stateSync).toContain("sync_subdivision_sale_case_lot_commercial_state");
    expect(stateSync).toContain("subdivision_sale_case_lots");
    expect(stateSync).toContain("SUBDIVISION_LOT_PHYSICAL_RESERVATION_CONFLICT");
    expect(transition).toContain("subdivision_lock_sale_case_lots");
    expect(transition).toContain("subdivision_approve_sale_case_legacy_a384");
    expect(transition).toContain("subdivision_delete_archived_sale_case_legacy_a384");
  });

  it("limpa vínculos antes do purge legado e remove o marcador comercial de toda a coleção", () => {
    expect(stateSync).toMatch(
      /create trigger\s+subdivision_sale_case_lot_links_before_case_delete\s+before delete on public\.subdivision_sale_cases/i
    );
    expect(stateSync).toContain(
      "delete from public.subdivision_sale_case_lots link\n   where link.organization_id = old.organization_id\n     and link.sale_case_id = old.id"
    );
    expect(stateSync).toContain(
      "delete from public.subdivision_lot_commercial_states state\n       where state.organization_id = old.organization_id\n         and state.sale_case_id = old.sale_case_id"
    );

    const legacyPurgeCall = transition.indexOf(
      "subdivision_delete_archived_sale_case_legacy_a384"
    );
    const wrapperCleanup = transition.indexOf(
      "delete from public.subdivision_sale_case_lots link"
    );

    expect(legacyPurgeCall).toBeGreaterThan(-1);
    expect(wrapperCleanup).toBeGreaterThan(legacyPurgeCall);
    expect(stateSync).toContain(
      "before delete on public.subdivision_sale_cases"
    );
  });

  it("une regras por coleção e bloqueia capped por lote sem alocação física", () => {
    expect(participation).toContain("any(v_lot_ids)");
    expect(participation).toContain(
      "SUBDIVISION_PARTICIPATION_MULTI_LOT_ALLOCATION_DENIED"
    );
    expect(participation).toContain("subdivision_materialize_sale_participation_snapshot");
    expect(participation).not.toContain("payment_status");
    expect(participation).not.toContain("paid_at");
  });
});
