import { describe, expect, it } from "vitest";
import { isDomainContextReady } from "./domainFoundationUi";

describe("domain foundation UI context gate", () => {
  it("keeps the query and forms blocked until organization, module and purpose are explicit", () => {
    expect(isDomainContextReady({ organizationId: "", module: "locacao", purposeCode: "CADASTRO_INICIAL" })).toBe(false);
    expect(isDomainContextReady({ organizationId: "550e8400-e29b-41d4-a716-446655440000", module: "locacao", purposeCode: "CADASTRO_INICIAL" })).toBe(true);
  });
});
