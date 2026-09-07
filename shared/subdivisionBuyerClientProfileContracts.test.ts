import { describe, expect, it } from "vitest";
import {
  subdivisionBuyerClientProfileLookupInputSchema,
  upsertSubdivisionBuyerClientContactPreferenceInputSchema,
  upsertSubdivisionBuyerClientProfileInputSchema,
  upsertSubdivisionBuyerClientRequirementInputSchema,
} from "./subdivisionBuyerClientProfileContracts";

const organizationId = "550e8400-e29b-41d4-a716-446655440000";
const buyerClientId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "loteadora", purposeCode: "CADASTRO_INICIAL" } as const;

describe("subdivision buyer client profile contracts", () => {
  it("accepts a minimized profile only in an explicit loteadora context", () => {
    expect(upsertSubdivisionBuyerClientProfileInputSchema.safeParse({
      ...context, correlationId, buyerClientId, partyKind: "individual", registrationState: "base_data_in_progress",
      documentReference: null, identityDocumentReference: null, primaryEmail: null, primaryPhone: null, messagingPhone: null,
      civilStatus: "not_declared", representationState: "not_declared",
    }).success).toBe(true);
    expect(upsertSubdivisionBuyerClientProfileInputSchema.safeParse({
      ...context, correlationId, buyerClientId, partyKind: "individual", registrationState: "base_data_in_progress",
      documentReference: null, identityDocumentReference: null, primaryEmail: null, primaryPhone: null, messagingPhone: null,
      civilStatus: "not_declared", representationState: "not_declared", income: "1000",
    }).success).toBe(false);
  });

  it("rejects a foreign module, invalid document reference, and commercial states", () => {
    expect(upsertSubdivisionBuyerClientProfileInputSchema.safeParse({
      ...context, module: "locacao", correlationId, buyerClientId, partyKind: "individual", registrationState: "base_data_in_progress",
      documentReference: null, identityDocumentReference: null, primaryEmail: null, primaryPhone: null, messagingPhone: null,
      civilStatus: "not_declared", representationState: "not_declared",
    }).success).toBe(false);
    expect(upsertSubdivisionBuyerClientProfileInputSchema.safeParse({
      ...context, correlationId, buyerClientId, partyKind: "individual", registrationState: "base_data_in_progress",
      documentReference: "123", identityDocumentReference: null, primaryEmail: null, primaryPhone: null, messagingPhone: null,
      civilStatus: "not_declared", representationState: "not_declared",
    }).success).toBe(false);
    expect(upsertSubdivisionBuyerClientProfileInputSchema.safeParse({
      ...context, correlationId, buyerClientId, partyKind: "individual", registrationState: "sale_approved",
      documentReference: null, identityDocumentReference: null, primaryEmail: null, primaryPhone: null, messagingPhone: null,
      civilStatus: "not_declared", representationState: "not_declared",
    }).success).toBe(false);
  });

  it("keeps requirement and contact permissions narrow, enumerated, and correlated", () => {
    expect(upsertSubdivisionBuyerClientRequirementInputSchema.safeParse({
      ...context, correlationId, buyerClientId, requirementCode: "representation_powers", requirementState: "to_confirm",
    }).success).toBe(true);
    expect(upsertSubdivisionBuyerClientRequirementInputSchema.safeParse({
      ...context, correlationId, buyerClientId, requirementCode: "credit_score", requirementState: "to_confirm",
    }).success).toBe(false);
    expect(upsertSubdivisionBuyerClientContactPreferenceInputSchema.safeParse({
      ...context, correlationId, buyerClientId, contactPurpose: "marketing_contact", contactChannel: "messaging", preferenceState: "revoked",
    }).success).toBe(true);
    expect(upsertSubdivisionBuyerClientContactPreferenceInputSchema.safeParse({
      ...context, correlationId, buyerClientId, contactPurpose: "credit_contact", contactChannel: "messaging", preferenceState: "granted",
    }).success).toBe(false);
  });

  it("uses a contextual buyer client identifier for protected reads", () => {
    expect(subdivisionBuyerClientProfileLookupInputSchema.safeParse({ ...context, buyerClientId }).success).toBe(true);
    expect(subdivisionBuyerClientProfileLookupInputSchema.safeParse({ ...context, buyerClientId, profileId: correlationId }).success).toBe(false);
  });

  it("accepts a bounded complementary identity reference and rejects malformed values", () => {
    expect(upsertSubdivisionBuyerClientProfileInputSchema.safeParse({
      ...context, correlationId, buyerClientId, partyKind: "individual", registrationState: "base_data_in_progress",
      documentReference: null, identityDocumentReference: "MG-12.345.678", primaryEmail: null, primaryPhone: null, messagingPhone: null,
      civilStatus: "not_declared", representationState: "not_declared",
    }).success).toBe(true);
    expect(upsertSubdivisionBuyerClientProfileInputSchema.safeParse({
      ...context, correlationId, buyerClientId, partyKind: "individual", registrationState: "base_data_in_progress",
      documentReference: null, identityDocumentReference: "x", primaryEmail: null, primaryPhone: null, messagingPhone: null,
      civilStatus: "not_declared", representationState: "not_declared",
    }).success).toBe(false);
  });
});
