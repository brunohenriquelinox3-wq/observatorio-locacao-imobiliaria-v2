import { describe, expect, it } from "vitest";
import { registerSubdivisionBuyerClientDirectInputSchema } from "./subdivisionContracts";

const base = { organizationId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8", module: "loteadora", purposeCode: "CADASTRO_INICIAL", correlationId: "7ba7b810-9dad-11d1-80b4-00c04fd430c8", partyKind: "individual", displayName: "Pessoa declarada" };

describe("subdivision direct buyer client contract", () => {
  it("accepts only a minimized direct registration within Loteadora", () => {
    expect(registerSubdivisionBuyerClientDirectInputSchema.safeParse(base).success).toBe(true);
    expect(registerSubdivisionBuyerClientDirectInputSchema.safeParse({ ...base, displayName: "X" }).success).toBe(false);
    expect(registerSubdivisionBuyerClientDirectInputSchema.safeParse({ ...base, module: "locacao" }).success).toBe(false);
  });

  it("rejects document, contact, commercial, financial, and contractual fields", () => {
    for (const extra of [{ documentReference: "00000000000" }, { primaryEmail: "contato@exemplo.com" }, { lotId: "8ba7b810-9dad-11d1-80b4-00c04fd430c8" }, { price: 1 }, { contractState: "ready" }]) {
      expect(registerSubdivisionBuyerClientDirectInputSchema.safeParse({ ...base, ...extra }).success).toBe(false);
    }
  });
});
