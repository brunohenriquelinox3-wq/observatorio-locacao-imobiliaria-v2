import { describe, expect, it } from "vitest";

describe("Supabase public authentication configuration", () => {
  it("reaches the configured authentication health endpoint without exposing the key", async () => {
    const url = process.env.VITE_SUPABASE_URL;
    const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    expect(url).toMatch(/^https:\/\/[a-z0-9]+\.supabase\.co$/);
    expect(publishableKey).toMatch(/^sb_publishable_/);

    const response = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: publishableKey! },
      signal: AbortSignal.timeout(10_000),
    });

    expect(response.ok).toBe(true);
  });
});
