import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const sql = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828020000_subdivision_economic_rule_component_role_reference_a34.sql"), "utf8");
describe("A34 economic rule component role reference migration", () => { it("requires one contextual development path and omits economic operations", () => { expect(sql).toContain("r.development_id=s.development_id"); expect(sql).toContain("require_subdivision_draft_authority"); expect(sql).toContain("correlation_id=p_correlation_id"); expect(sql).toContain("payload_redacted"); expect(sql).toContain("to service_role"); expect(sql).not.toMatch(/\b(amount|percentage|payment|billing|payout)\b/i); }); });
