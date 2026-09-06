import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(new URL("../supabase/migrations/20260906193000_subdivision_physical_dossier_a202.sql", import.meta.url), "utf8");
const reservationSource = readFileSync(new URL("../supabase/migrations/20260907119000_subdivision_lot_physical_reservation_a253.sql", import.meta.url), "utf8");
const operationalProfileSource = readFileSync(new URL("../supabase/migrations/20260907120000_subdivision_lot_operational_profile_a255.sql", import.meta.url), "utf8");

describe("migração A202 de estrutura física e dossiê", () => {
  it("mantém somente atributos físicos e estados de pendência no escopo", () => {
    expect(source).toContain("area_sqm numeric");
    expect(source).toContain("subdivision_development_requirements");
    expect(source).not.toMatch(/add column (price|sale|contract|customer|payment)/i);
  });

  it("exige autoridade ativa, RLS e execução exclusiva ao servidor", () => {
    expect(source).toContain("require_active_subdivision_draft_authority");
    expect(source).toContain("enable row level security");
    expect(source).toContain("revoke all on function");
    expect(source).toContain("grant execute on function public.subdivision_apply_draft_physical_structure_v1");
    expect(source).toContain("security definer set search_path = ''");
  });

  it("requer confirmação para retirar Quadras ou Lotes existentes", () => {
    expect(source).toContain("SUBDIVISION_PHYSICAL_STRUCTURE_REPLACEMENT_CONFIRMATION_REQUIRED");
    expect(source).toContain("incoming.lots");
    expect(source).toContain("state = 'archived'");
  });

  it("mantém a finalidade reservada segregada de disponibilidade e preço", () => {
    expect(reservationSource).toContain("subdivision_lot_physical_reservations");
    expect(reservationSource).toContain("landowner_reserve");
    expect(reservationSource).toContain("technical_artesian_well");
    expect(reservationSource).toContain("technical_water_tank");
    expect(reservationSource).not.toMatch(/availability|price|sale|contract|payment|financial/i);
  });

  it("exige autoridade, idempotência, RLS e execução exclusiva ao servidor", () => {
    expect(reservationSource).toContain("require_active_subdivision_draft_authority");
    expect(reservationSource).toContain("correlation_id");
    expect(reservationSource).toContain("payload_redacted");
    expect(reservationSource).toContain("enable row level security");
    expect(reservationSource).toContain("security definer set search_path = ''");
    expect(reservationSource).toContain("grant execute on function public.subdivision_upsert_draft_lot_physical_reservation_v1");
  });

  it("mantém a ficha operacional em escopo físico e filtra observação interna sensível", () => {
    expect(operationalProfileSource).toContain("subdivision_lot_internal_notes");
    expect(operationalProfileSource).toContain("subdivision_upsert_draft_lot_operational_profile_v1");
    expect(operationalProfileSource).toContain("internal_note !~*");
    expect(operationalProfileSource).toContain("has_internal_note");
    expect(operationalProfileSource).toContain("require_active_subdivision_draft_authority");
    expect(operationalProfileSource).toContain("security definer set search_path=''");
  });
});
