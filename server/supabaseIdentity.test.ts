import { describe, expect, it, vi } from "vitest";
import { resolveSupabaseSubjectId } from "./supabaseIdentity";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";

describe("Supabase identity bridge", () => {
  it("returns only the subject UUID for a validated access token", async () => {
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: subjectId } }, error: null }) },
    } as never;

    await expect(resolveSupabaseSubjectId("session-token", client)).resolves.toBe(subjectId);
  });

  it("fails closed for missing, oversized or rejected tokens", async () => {
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: new Error("rejected") }) },
    } as never;

    await expect(resolveSupabaseSubjectId(undefined, client)).resolves.toBeNull();
    await expect(resolveSupabaseSubjectId("x".repeat(8_193), client)).resolves.toBeNull();
    await expect(resolveSupabaseSubjectId("rejected", client)).resolves.toBeNull();
  });
});
