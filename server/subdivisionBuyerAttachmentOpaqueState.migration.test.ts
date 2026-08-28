import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sql = readFileSync(resolve(import.meta.dirname, "../supabase/migrations/20260828013000_subdivision_buyer_attachment_opaque_state_a26.sql"), "utf8");

describe("A26 buyer attachment opaque state migration", () => {
  it("returns only the two declared states and keeps document metadata outside the result", () => {
    expect(sql).toContain("awaiting_private_upload");
    expect(sql).toContain("private_upload_recorded");
    expect(sql).toContain("to service_role");
    expect(sql).not.toMatch(/returns table\([^)]*(storage_key|content_type|byte_size|uploaded_at)/i);
    expect(sql).not.toContain("url");
  });
});
