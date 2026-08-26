import { describe, expect, it } from "vitest";

describe("Supabase development connection", () => {
  it("validates the server-only secret without assuming an administrative schema", async () => {
    const baseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(baseUrl).toMatch(/^https:\/\/.+\.supabase\.co$/);
    expect(serviceKey).toBeTruthy();

    const response = await fetch(
      `${baseUrl}/auth/v1/settings`,
      {
        headers: {
          apikey: serviceKey!,
          Authorization: `Bearer ${serviceKey!}`,
          Accept: "application/json",
        },
      },
    );

    expect(response.ok).toBe(true);
  });
});
