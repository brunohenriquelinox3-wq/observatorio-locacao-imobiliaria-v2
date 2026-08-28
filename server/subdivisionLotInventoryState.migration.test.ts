import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const sql = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828008500_subdivision_lot_inventory_state_a20.sql"), "utf8");
describe("A20 lot inventory state migration", () => { it("keeps the state contextual, idempotent and server-only", () => { expect(sql).toContain("SUBDIVISION_LOT_CONTEXT_DENIED"); expect(sql).toContain("correlation_id=p_correlation_id"); expect(sql).toContain("payload_redacted"); expect(sql).toContain("to service_role"); }); });
