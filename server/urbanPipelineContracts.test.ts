import { describe, expect, it } from "vitest";
import { draftUrbanAgendaInputSchema, draftUrbanLeadInputSchema, urbanLeadStageInputSchema } from "../shared/urbanPipelineContracts";

const organizationId = "550e8400-e29b-41d4-a716-446655440000";
const partyId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const leadId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";
const correlationId = "8ba7b810-9dad-11d1-80b4-00c04fd430c8";
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
});
