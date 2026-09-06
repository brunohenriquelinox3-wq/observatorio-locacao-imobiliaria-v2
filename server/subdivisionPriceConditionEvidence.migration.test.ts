import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("subdivision condition evidence submission migration", () => {
  const sql = readFileSync(resolve(process.cwd(), "supabase/migrations/20260907109000_subdivision_condition_submit_evidence_a243.sql"), "utf8");
  const approvalSql = readFileSync(resolve(process.cwd(), "supabase/migrations/20260907115000_subdivision_condition_approval_evidence_a249.sql"), "utf8");
  const withdrawalSql = readFileSync(resolve(process.cwd(), "supabase/migrations/20260907116000_subdivision_condition_withdraw_reason_a250.sql"), "utf8");

  it("requires an active private evidence link before submission", () => {
    expect(sql).toContain("subdivision_submit_price_condition_v2");
    expect(sql).toContain("subdivision_price_evidence_links");
    expect(sql).toContain("PRICE_CONDITION_EVIDENCE_REQUIRED");
    expect(sql).toContain("a.attachment_state = 'recorded'");
  });

  it("retains protected execution and never records attachment content", () => {
    expect(sql).toContain("security definer set search_path = ''");
    expect(sql).toContain("revoke all on function public.subdivision_submit_price_condition_v2");
    expect(sql).toContain("grant execute on function public.subdivision_submit_price_condition_v2");
    expect(sql).not.toContain("storage_key");
    expect(sql).not.toContain("original_name");
  });

  it("revalidates active private evidence before approval with protected execution", () => {
    expect(approvalSql).toContain("subdivision_approve_price_condition_v2");
    expect(approvalSql).toContain("subdivision_price_evidence_links");
    expect(approvalSql).toContain("PRICE_CONDITION_EVIDENCE_REQUIRED");
    expect(approvalSql).toContain("security definer set search_path = ''");
    expect(approvalSql).toContain("revoke all on function public.subdivision_approve_price_condition_v2");
    expect(approvalSql).toContain("grant execute on function public.subdivision_approve_price_condition_v2");
    expect(approvalSql).not.toContain("storage_key");
    expect(approvalSql).not.toContain("original_name");
  });

  it("requires a governed reason before withdrawing a non-approved condition", () => {
    expect(withdrawalSql).toContain("subdivision_withdraw_price_condition_v2");
    expect(withdrawalSql).toContain("p_reason_code text");
    expect(withdrawalSql).toContain("PRICE_CONDITION_WITHDRAW_REASON_INVALID");
    expect(withdrawalSql).toContain("withdraw_reason_code");
    expect(withdrawalSql).toContain("security definer set search_path = ''");
    expect(withdrawalSql).toContain("revoke all on function public.subdivision_withdraw_price_condition_v2");
    expect(withdrawalSql).toContain("grant execute on function public.subdivision_withdraw_price_condition_v2");
  });
});
