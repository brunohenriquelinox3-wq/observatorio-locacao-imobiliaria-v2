import { describe, expect, it, vi } from "vitest";
import { getFoundationReadiness, type FoundationCountReader } from "./foundationReadiness";

describe("foundation readiness", () => {
  it("returns only aggregated readiness counts and keeps commands blocked", async () => {
    const counts = {
      organizations: 0,
      platform_principals: 0,
      administrative_grants: 0,
      admin_audit_events: 0,
    } as const;
    const readCount = vi.fn(async table => counts[table]) satisfies FoundationCountReader;

    await expect(getFoundationReadiness(readCount)).resolves.toEqual({
      environment: "development",
      directBrowserAccess: "denied",
      commandMode: "blocked",
      counts: {
        organizations: 0,
        principals: 0,
        grants: 0,
        auditEvents: 0,
      },
    });
    expect(readCount).toHaveBeenCalledTimes(4);
  });

  it("returns a safe error code when the foundation cannot be read", async () => {
    const unavailable: FoundationCountReader = async () => {
      throw new Error("provider detail must not reach the client");
    };

    await expect(getFoundationReadiness(unavailable)).rejects.toThrow(
      "FOUNDATION_READINESS_UNAVAILABLE",
    );
  });
});
