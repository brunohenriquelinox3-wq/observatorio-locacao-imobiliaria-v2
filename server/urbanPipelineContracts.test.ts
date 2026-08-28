import { describe, expect, it } from "vitest";
import { draftUrbanAgendaClassificationInputSchema, draftUrbanAgendaInputSchema, draftUrbanLeadInputSchema, draftUrbanLeadSearchProfileInputSchema, urbanLeadAssetLinkInputSchema, urbanLeadStageInputSchema } from "../shared/urbanPipelineContracts";

const organizationId = "550e8400-e29b-41d4-a716-446655440000";
const partyId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const leadId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const agendaId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const assetId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "9ba7b810-9dad-11d1-80b4-00c04fd430c8";
const context = { organizationId, module: "vendas_urbanas" as const, purposeCode: "CADASTRO_INICIAL", correlationId };

describe("urban pipeline contracts", () => {
  it("requires explicit sales context, Party and source for an intake draft", () => {
    expect(draftUrbanLeadInputSchema.safeParse({ ...context, partyId, sourceCode: "OPERADOR", interestKind: "search_profile" }).success).toBe(true);
    expect(draftUrbanLeadInputSchema.safeParse({ ...context, module: "locacao", partyId, sourceCode: "OPERADOR" }).success).toBe(false);
  });

  it("requires reason codes for loss, cancellation and no-show without modeling a proposal", () => {
    expect(urbanLeadStageInputSchema.safeParse({ ...context, leadId, nextStage: "closed_lost" }).success).toBe(false);
    expect(urbanLeadStageInputSchema.safeParse({ ...context, leadId, nextStage: "closed_lost", reasonCode: "DESISTENCIA" }).success).toBe(true);
    expect(draftUrbanAgendaInputSchema.safeParse({ ...context, leadId, scheduledFor: "2026-08-28T14:00:00.000Z", state: "cancelled" }).success).toBe(false);
    expect(draftUrbanAgendaInputSchema.safeParse({ ...context, leadId, scheduledFor: "2026-08-28T14:00:00.000Z", state: "scheduled" }).success).toBe(true);
  });

  it("accepts a contextual UUID pair for the urban lead asset link", () => {
    expect(urbanLeadAssetLinkInputSchema.safeParse({ ...context, leadId, assetId }).success).toBe(true);
    expect(urbanLeadAssetLinkInputSchema.safeParse({ ...context, module: "locacao", leadId, assetId }).success).toBe(false);
  });

  it("accepts a bounded coded search profile only in the urban sales context", () => {
    expect(draftUrbanLeadSearchProfileInputSchema.safeParse({ ...context, leadId, acceptedAssetKinds: ["apartment", "house"], searchTiming: "up_to_90_days", preferenceCode: "MORADIA_URBANA" }).success).toBe(true);
    expect(draftUrbanLeadSearchProfileInputSchema.safeParse({ ...context, leadId, acceptedAssetKinds: ["house", "house"], searchTiming: "immediate" }).success).toBe(false);
    expect(draftUrbanLeadSearchProfileInputSchema.safeParse({ ...context, module: "locacao", leadId, acceptedAssetKinds: ["house"], searchTiming: "flexible" }).success).toBe(false);
  });

  it("accepts an internal agenda classification only in the urban sales context", () => {
    expect(draftUrbanAgendaClassificationInputSchema.safeParse({ ...context, correlationId, agendaId, classification: "context_preparation", internalCode: "EM_REVISAO" }).success).toBe(true);
    expect(draftUrbanAgendaClassificationInputSchema.safeParse({ ...context, correlationId, agendaId, classification: "context_preparation", internalCode: "texto livre" }).success).toBe(false);
    expect(draftUrbanAgendaClassificationInputSchema.safeParse({ ...context, module: "locacao", correlationId, agendaId, classification: "lead_review" }).success).toBe(false);
  });
});
