import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = () => readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907102000_subdivision_price_condition_lot_resolution_a232.sql"), "utf8");
const denyPolicyMigration = () => readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907106000_subdivision_price_conditions_deny_policies_a239.sql"), "utf8");
const contextMigration = () => readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907107000_subdivision_lot_price_context_a240.sql"), "utf8");
const totalContextMigration = () => readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907118000_subdivision_lot_price_total_a251.sql"), "utf8");

describe("subdivision price condition lot resolution migration", () => {
  it("resolves a Lot number inside the protected server function instead of receiving its identifier from the browser", () => {
    const sql = migration();
    expect(sql).toContain("p_lot_number integer");
    expect(sql).toContain("select l.id into v_lot_id");
    expect(sql).toContain("l.lot_number = p_lot_number");
    expect(sql).toContain("lot_id, adjustment_kind");
  });

  it("preserves protected authority, audit redaction and service-only execution", () => {
    const sql = migration();
    expect(sql).toContain("private.require_active_subdivision_draft_authority");
    expect(sql).toContain("security definer set search_path = ''");
    expect(sql).toContain("payload_redacted");
    expect(sql).toContain("revoke all on function public.subdivision_create_price_condition_v2");
    expect(sql).toContain("grant execute on function public.subdivision_create_price_condition_v2");
  });

  it("returns a price reference only from an approved exception-free base policy", () => {
    const sql = migration();
    expect(sql).toContain("p.policy_state = 'approved'::public.subdivision_price_base_policy_state");
    expect(sql).toContain("p.exception_count = 0");
    expect(sql).toContain("c.condition_state = 'approved'::public.subdivision_price_base_policy_state");
    expect(sql).toContain("when 'lot'::public.subdivision_price_condition_scope then 3");
  });

  it("declares explicit fail-closed RLS policies for direct callers", () => {
    const sql = denyPolicyMigration();
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("subdivision_price_conditions_deny_anon");
    expect(sql).toContain("subdivision_price_conditions_deny_authenticated");
    expect(sql).toContain("as restrictive");
    expect(sql).toContain("using (false)");
    expect(sql).toContain("with check (false)");
    expect(sql).toContain("revoke all on table public.subdivision_price_conditions from public, anon, authenticated");
  });

  it("explains unavailable context without returning an unapproved price", () => {
    const sql = contextMigration();
    expect(sql).toContain("subdivision_get_lot_price_context_v3");
    expect(sql).toContain("prepared_with_exceptions");
    expect(sql).toContain("submitted_pending_approval");
    expect(sql).toContain("approved_outside_vigency");
    expect(sql).toContain("p.policy_state = 'approved'::public.subdivision_price_base_policy_state");
    expect(sql).toContain("p.exception_count = 0");
    expect(sql).toContain("revoke all on function public.subdivision_get_lot_price_context_v3");
  });

  it("calcula área e total somente quando a referência continua ativa", () => {
    const sql = totalContextMigration();
    expect(sql).toContain("subdivision_get_lot_price_context_v4");
    expect(sql).toContain("v_area * v_effective");
    expect(sql).toContain("case when v_area > 0 then v_area else null end");
    expect(sql).toContain("p.policy_state = 'approved'::public.subdivision_price_base_policy_state");
    expect(sql).toContain("p.exception_count = 0");
    expect(sql).toContain("security definer set search_path = ''");
    expect(sql).toContain("grant execute on function public.subdivision_get_lot_price_context_v4");
  });
});
