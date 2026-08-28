import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sql = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828015000_subdivision_sale_draft_attachment_coverage_a28.sql"), "utf8");

describe("A28 sale draft attachment coverage migration", () => {
  it("keeps attachment coverage contextual and opaque", () => {
    expect(sql).toContain("require_subdivision_draft_authority");
    expect(sql).toContain("no_attachment_intent");
    expect(sql).toContain("attachment_awaiting_private_upload");
    expect(sql).toContain("attachment_private_upload_recorded");
    expect(sql).toContain("to service_role");
    expect(sql).not.toMatch(/returns table\([^)]*(storage_key|content_type|byte_size|uploaded_at)/i);
    expect(sql).not.toContain("url");
  });
});
