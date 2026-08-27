import { describe, expect, it, vi } from "vitest";
import { attestSupabaseMfa, resolveSupabaseSubjectId } from "./supabaseIdentity";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const now = new Date("2026-08-27T23:20:00.000Z");
const tokenWith = (payload: Record<string, unknown>) => `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;

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

  it("attests only a validated, confirmed and recently verified AAL2 TOTP token", async () => {
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: subjectId, email_confirmed_at: "2026-08-01T00:00:00.000Z" } }, error: null }) },
    } as never;
    const token = tokenWith({ sub: subjectId, aal: "aal2", amr: [{ method: "totp", timestamp: Math.floor(now.getTime() / 1_000) - 30 }] });

    await expect(attestSupabaseMfa(token, client, now)).resolves.toMatchObject({
      subjectId,
      assuranceLevel: "aal2",
      method: "totp",
      verifiedRecoveryChannel: true,
    });
  });

  it("fails closed when AAL, MFA recency, subject match or verified recovery is missing", async () => {
    const client = {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: subjectId, email_confirmed_at: null } }, error: null }) },
    } as never;
    const staleToken = tokenWith({ sub: subjectId, aal: "aal2", amr: [{ method: "totp", timestamp: Math.floor(now.getTime() / 1_000) - 901 }] });
    const weakToken = tokenWith({ sub: subjectId, aal: "aal1", amr: [{ method: "password", timestamp: Math.floor(now.getTime() / 1_000) }] });

    await expect(attestSupabaseMfa(staleToken, client, now)).resolves.toBeNull();
    await expect(attestSupabaseMfa(weakToken, client, now)).resolves.toBeNull();
  });
});
