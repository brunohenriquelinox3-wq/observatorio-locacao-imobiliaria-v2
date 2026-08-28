import { describe, expect, it } from "vitest";
import {
  draftAssetModuleStateInputSchema,
  draftAssetPartyRelationInputSchema,
  draftUrbanAssetInputSchema,
} from "../shared/assetFoundationContracts";

const organizationId = "550e8400-e29b-41d4-a716-446655440000";
const correlationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const assetId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const partyId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";

describe("urban asset foundation contracts", () => {
  it("allows only a minimized urban asset draft with explicit context", () => {
    expect(draftUrbanAssetInputSchema.safeParse({ organizationId, module: "vendas_urbanas", purposeCode: "CADASTRO_INICIAL", correlationId, kind: "apartment", referenceLabel: "Unidade em rascunho", internalReference: "VU-001" }).success).toBe(true);
    expect(draftUrbanAssetInputSchema.safeParse({ organizationId, module: "platform", purposeCode: "CADASTRO_INICIAL", correlationId, kind: "apartment", referenceLabel: "Unidade", internalReference: "VU-001" }).success).toBe(false);
  });

  it("requires scoped relations and records blocked availability with a reason", () => {
    expect(draftAssetPartyRelationInputSchema.safeParse({ organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL", correlationId, assetId, partyId, relation: "ownership_claim" }).success).toBe(true);
    expect(draftAssetModuleStateInputSchema.safeParse({ organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL", correlationId, assetId, state: "blocked" }).success).toBe(false);
    expect(draftAssetModuleStateInputSchema.safeParse({ organizationId, module: "locacao", purposeCode: "CADASTRO_INICIAL", correlationId, assetId, state: "blocked", reasonCode: "PENDENCIA_DOCUMENTAL" }).success).toBe(true);
  });
});
