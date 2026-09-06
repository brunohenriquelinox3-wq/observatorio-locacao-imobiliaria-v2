import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = () => readFileSync(path.resolve(process.cwd(), "supabase/migrations/20260907102000_subdivision_price_condition_lot_resolution_a232.sql"), "utf8");

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
});
