import { describe, expect, it } from "vitest";
import { getPlatformGovernanceOverview } from "./platformGovernanceOverview";

describe("platform governance overview", () => {
  it("distinguishes the active platform role from organization access", () => {
    const overview = getPlatformGovernanceOverview({ isPlatformSuperAdmin: true, organizations: 1, grants: 1 });
    expect(overview[0].value).toBe("SUPER ADM ativo");
    expect(overview[1].value).toBe("1 ativada(s)");
    expect(overview[3].detail).toContain("nunca é inferida");
  });

  it("does not claim platform authority before status is confirmed", () => {
    expect(getPlatformGovernanceOverview({ isPlatformSuperAdmin: false })[0].value).toBe("Alçada em verificação");
  });
});
