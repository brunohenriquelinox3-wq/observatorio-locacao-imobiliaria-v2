import { describe, expect, it } from "vitest";
import { domainContextSchema, draftPartyInputSchema, draftPartyRoleInputSchema } from "../shared/domainFoundationContracts";

const organizationId = "550e8400-e29b-41d4-a716-446655440000";
const correlationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const partyId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";

describe("canonical domain foundation contracts", () => {
  it("requires an explicit organization, module and purpose for every draft", () => {
    expect(domainContextSchema.safeParse({ organizationId, module: "vendas_urbanas", purposeCode: "CADASTRO_INICIAL" }).success).toBe(true);
    expect(domainContextSchema.safeParse({ organizationId, module: "platform", purposeCode: "CADASTRO_INICIAL" }).success).toBe(false);
    expect(domainContextSchema.safeParse({ organizationId, module: "locacao", purposeCode: "L" }).success).toBe(false);
  });

  it("accepts only minimized Party drafts and roles with coherent temporal boundaries", () => {
    expect(draftPartyInputSchema.safeParse({ organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL", correlationId, kind: "individual", displayName: "Parte de teste" }).success).toBe(true);
    expect(draftPartyInputSchema.safeParse({ organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL", correlationId, kind: "individual", displayName: "X" }).success).toBe(false);
    expect(draftPartyRoleInputSchema.safeParse({ organizationId, module: "vendas_urbanas", purposeCode: "CADASTRO_INICIAL", correlationId, partyId, role: "buyer", beginsAt: "2026-08-27T00:00:00.000Z", endsAt: "2026-08-26T00:00:00.000Z" }).success).toBe(false);
  });
});
