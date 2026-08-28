import { describe, expect, it } from "vitest";
import { draftRentalAgendaInputSchema, draftRentalIntakeInputSchema, draftRentalManagementScopeInputSchema, draftRentalTenantSearchProfileInputSchema, rentalIntakeStageInputSchema, rentalManagementAssetLinkInputSchema } from "../shared/rentalPipelineContracts";

const organizationId = "550e8400-e29b-41d4-a716-446655440000";
const partyId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const intakeId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const assetId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "locacao" as const, purposeCode: "CADASTRO_INICIAL", correlationId };

describe("rental pipeline contracts", () => {
  it("keeps management and tenant intake inside the Locação module", () => {
    expect(draftRentalIntakeInputSchema.safeParse({ ...context, partyId, journeyKind: "management_interest", sourceCode: "OPERADOR" }).success).toBe(true);
    expect(draftRentalIntakeInputSchema.safeParse({ ...context, module: "vendas_urbanas", partyId, journeyKind: "tenant_interest", sourceCode: "OPERADOR" }).success).toBe(false);
  });

  it("requires a reason for loss, cancellation and no-show without creating a contract", () => {
    expect(rentalIntakeStageInputSchema.safeParse({ ...context, intakeId, nextStage: "closed_lost" }).success).toBe(false);
    expect(rentalIntakeStageInputSchema.safeParse({ ...context, intakeId, nextStage: "closed_lost", reasonCode: "DESISTENCIA" }).success).toBe(true);
    expect(draftRentalAgendaInputSchema.safeParse({ ...context, intakeId, scheduledFor: "2026-08-28T14:00:00.000Z", state: "not_held" }).success).toBe(false);
    expect(draftRentalAgendaInputSchema.safeParse({ ...context, intakeId, scheduledFor: "2026-08-28T14:00:00.000Z", state: "scheduled" }).success).toBe(true);
  });

  it("accepts only a contextual UUID pair for a management asset link", () => {
    expect(rentalManagementAssetLinkInputSchema.parse({ ...context, intakeId, assetId })).toMatchObject({ module: "locacao", intakeId, assetId });
    expect(rentalManagementAssetLinkInputSchema.safeParse({ ...context, module: "vendas_urbanas", intakeId, assetId }).success).toBe(false);
  });

  it("accepts a small coded search profile only inside the Locação context", () => {
    expect(draftRentalTenantSearchProfileInputSchema.safeParse({ ...context, intakeId, acceptedAssetKinds: ["apartment", "house"], occupancyTiming: "up_to_30_days", preferenceCode: "MORADIA_URBANA" }).success).toBe(true);
    expect(draftRentalTenantSearchProfileInputSchema.safeParse({ ...context, intakeId, acceptedAssetKinds: [], occupancyTiming: "immediate", preferenceCode: "MORADIA_URBANA" }).success).toBe(false);
    expect(draftRentalTenantSearchProfileInputSchema.safeParse({ ...context, module: "vendas_urbanas", intakeId, acceptedAssetKinds: ["house"], occupancyTiming: "flexible", preferenceCode: "MORADIA_URBANA" }).success).toBe(false);
  });

  it("accepts a coded declared scope only inside the Locação context", () => {
    expect(draftRentalManagementScopeInputSchema.safeParse({ ...context, intakeId, declaredScope: "full_administration_interest", internalNoteCode: "EM_REVISAO" }).success).toBe(true);
    expect(draftRentalManagementScopeInputSchema.safeParse({ ...context, intakeId, declaredScope: "full_administration_interest", internalNoteCode: "texto livre" }).success).toBe(false);
    expect(draftRentalManagementScopeInputSchema.safeParse({ ...context, module: "vendas_urbanas", intakeId, declaredScope: "undecided" }).success).toBe(false);
  });
});
