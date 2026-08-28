import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const sql = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828010500_subdivision_buyer_attachment_metadata_a24.sql"), "utf8");
describe("A24 buyer attachment intent migration", () => { it("keeps metadata opaque, contextual and server-only", () => { expect(sql).toContain("SUBDIVISION_ATTACHMENT_CONTEXT_DENIED"); expect(sql).toContain("correlation_id=p_correlation_id"); expect(sql).toContain("payload_redacted"); expect(sql).toContain("to service_role"); expect(sql).not.toContain("storage_key"); }); });
