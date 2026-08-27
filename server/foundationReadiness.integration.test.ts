import { describe, expect, it } from "vitest";
import { getFoundationReadiness } from "./foundationReadiness";

describe("foundation readiness integration", () => {
  it("reads only aggregate readiness from the configured development environment", async () => {
    const readiness = await getFoundationReadiness();

    expect(readiness).toMatchObject({
      environment: "development",
      directBrowserAccess: "denied",
      commandMode: "blocked",
    });
    expect(readiness.counts).toEqual({
      organizations: expect.any(Number),
      principals: expect.any(Number),
      grants: expect.any(Number),
      auditEvents: expect.any(Number),
    });
  });
});
