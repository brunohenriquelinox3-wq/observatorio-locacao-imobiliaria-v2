import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const policyMigration = () => readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907090000_subdivision_price_base_policy_a223.sql"), "utf8");
const rlsMigration = () => readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907091000_subdivision_price_base_deny_policies_a224.sql"), "utf8");
const scopeMigration = () => readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907092000_subdivision_price_base_scope_a225.sql"), "utf8");
const correctedScopeMigration = () => readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907103000_subdivision_price_base_list_draft_scope_a234.sql"), "utf8");
const matrixAreaMigration = () => readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907104000_subdivision_price_base_matrix_area_a237.sql"), "utf8");
const manualCorrectionMigration = () => readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907105000_subdivision_manual_price_base_correction_a238.sql"), "utf8");

describe("subdivision price-base policy migrations", () => {
  it("keeps price-base separate from contracts and commercial effects", () => {
    const sql = policyMigration();
    expect(sql).toContain("Não cria cliente, disponibilidade, reserva, venda, proposta, contrato, cobrança, pagamento, repasse, imposto, receita ou integração externa.");
    expect(sql).toContain("subdivision_price_base_policies");
    expect(sql).toContain("subdivision_price_base_policy_lines");
    expect(sql).toContain("policy_state");
  });

  it("requires protected authority, secure search paths, audit redaction and separate approval", () => {
    const sql = policyMigration();
    expect(sql).toContain("private.require_active_subdivision_draft_authority");
    expect(sql).toContain("security definer set search_path = ''");
    expect(sql).toContain("payload_redacted");
    expect(sql).toContain("approved_by <> created_by");
    expect(sql).toContain("PRICE_BASE_POLICY_APPROVAL_DENIED");
  });

  it("blocks direct roles and uses explicit fail-closed RLS policies", () => {
    const sql = policyMigration();
    const rls = rlsMigration();
    expect(sql).toContain("revoke all on table public.subdivision_price_base_policies from public, anon, authenticated");
    expect(sql).toContain("revoke all on function public.subdivision_prepare_price_base_policy_v1");
    expect(sql).toContain("grant execute on function public.subdivision_prepare_price_base_policy_v1");
    expect(rls).toContain("as restrictive");
    expect(rls).toContain("using (false)");
    expect(rls).toContain("with check (false)");
  });

  it("limits list RPC results to the selected active development", () => {
    const sql = scopeMigration();
    expect(sql).toContain("p_development_id uuid");
    expect(sql).toContain("policy.development_id = p_development_id");
    expect(sql).toContain("PRICE_BASE_DEVELOPMENT_SCOPE_DENIED");
    expect(sql).toContain("drop function if exists public.subdivision_list_price_base_policies_v1");
  });

  it("uses the real draft lifecycle field when validating the selected development", () => {
    const sql = correctedScopeMigration();
    expect(sql).toContain("development.state = 'draft'::public.party_lifecycle_state");
    expect(sql).not.toContain("development.lifecycle_state");
    expect(sql).toContain("security definer");
    expect(sql).toContain("set search_path = ''");
    expect(sql).toContain("PRICE_BASE_DEVELOPMENT_SCOPE_DENIED");
  });

  it("uses a confirmed matrix area only for a missing source area and preserves fail-closed functions", () => {
    const sql = matrixAreaMigration();
    expect(sql).toContain("area_provenance");
    expect(sql).toContain("matrix_physical");
    expect(sql).toContain("source.area_sqm is null and lot.area_sqm is not null and lot.area_sqm > 0");
    expect(sql).toContain("coalesce(source.area_sqm, lot.area_sqm)");
    expect(sql).toContain("subdivision_preview_price_base_source_v2");
    expect(sql).toContain("subdivision_prepare_price_base_policy_v2");
    expect(sql).toContain("security definer set search_path = ''");
    expect(sql).toContain("revoke all on function public.subdivision_prepare_price_base_policy_v2");
    expect(sql).toContain("grant execute on function public.subdivision_prepare_price_base_policy_v2");
  });

  it("prepares a manual correction only as a derived policy with explicit source row, physical resolution and service-only execution", () => {
    const sql = manualCorrectionMigration();
    expect(sql).toContain("p_source_row integer");
    expect(sql).toContain("p_price_per_sqm_brl numeric");
    expect(sql).toContain("v_source_policy.exception_count <> 1");
    expect(sql).toContain("PRICE_BASE_MANUAL_CORRECTION_POLICY_DENIED");
    expect(sql).toContain("PRICE_BASE_MANUAL_CORRECTION_PHYSICAL_DENIED");
    expect(sql).toContain("lot.area_sqm");
    expect(sql).toContain("security definer set search_path = ''");
    expect(sql).toContain("payload_redacted");
    expect(sql).toContain("revoke all on function public.subdivision_prepare_manual_price_base_correction_v1");
    expect(sql).toContain("grant execute on function public.subdivision_prepare_manual_price_base_correction_v1");
  });
});
