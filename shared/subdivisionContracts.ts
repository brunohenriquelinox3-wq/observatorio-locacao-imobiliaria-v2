import { z } from "zod";
import { domainContextSchema, partyKindSchema } from "./domainFoundationContracts";

export const subdivisionContextSchema = domainContextSchema.extend({
  module: z.literal("loteadora"),
});

export const subdivisionDevelopmentPhaseSchema = z.enum([
  "preliminary_reference",
  "structuring",
  "review_required",
]);

export const draftSubdivisionBlockInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  blockNumber: z.number().int().min(1).max(999),
});

export const draftSubdivisionLotInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  blockId: z.string().uuid(),
  lotNumber: z.number().int().min(1).max(100),
});

export const subdivisionLotInventoryPhaseSchema = z.enum(["reference_confirmed", "structure_review", "review_required"]);
export const draftSubdivisionLotInventoryStateInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  lotId: z.string().uuid(),
  inventoryPhase: subdivisionLotInventoryPhaseSchema,
});

export const draftSubdivisionBuyerClientInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  partyRoleAssignmentId: z.string().uuid(),
});

export const registerSubdivisionBuyerClientDirectInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  partyKind: partyKindSchema,
  displayName: z.string().trim().min(2).max(160),
}).strict();

export const registerSubdivisionClientDirectInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  partyKind: partyKindSchema,
  displayName: z.string().trim().min(2).max(160),
}).strict();

export const archiveSubdivisionClientInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  buyerClientId: z.string().uuid(),
}).strict();

export const restoreSubdivisionClientInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  buyerClientId: z.string().uuid(),
}).strict();

export const draftSubdivisionBuyerAttachmentIntentInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  buyerClientId: z.string().uuid(),
});

export const draftSubdivisionSaleDraftInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  lotId: z.string().uuid(),
  buyerClientId: z.string().uuid(),
});

export const subdivisionSaleDraftWorkPhaseSchema = z.enum(["link_review", "attachment_review", "human_review"]);
export const draftSubdivisionSaleDraftWorkStateInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  saleDraftId: z.string().uuid(),
  workPhase: subdivisionSaleDraftWorkPhaseSchema,
});

export const draftSubdivisionSaleDraftCoBuyerInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  saleDraftId: z.string().uuid(),
  buyerClientId: z.string().uuid(),
});

export const subdivisionEconomicRuleSetWorkingStateSchema = z.enum(["draft_internal", "review_required"]);
export const draftSubdivisionEconomicRuleSetInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  versionReference: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/),
  workingState: subdivisionEconomicRuleSetWorkingStateSchema,
});

export const subdivisionEconomicRuleComponentCodeSchema = z.enum(["entry_reference", "installment_reference", "intermediate_reference", "final_result_reference"]);
export const draftSubdivisionEconomicRuleComponentInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  economicRuleSetId: z.string().uuid(),
  componentCode: subdivisionEconomicRuleComponentCodeSchema,
  workingState: subdivisionEconomicRuleSetWorkingStateSchema,
});

export const draftSubdivisionEconomicRuleComponentRoleReferenceInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  economicRuleComponentId: z.string().uuid(),
  internalPartyRoleLinkId: z.string().uuid(),
});

export const draftSubdivisionDevelopmentInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  internalReference: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/),
  workingPhase: subdivisionDevelopmentPhaseSchema,
});

export const subdivisionPlanningStateSchema = z.enum([
  "reference",
  "internal_study",
  "project_preparation",
  "internal_review",
]);

export const subdivisionCompliancePreparationStateSchema = z.enum([
  "not_started",
  "internal_organization",
  "evidence_for_review",
]);

export const subdivisionImplementationPreparationStateSchema = z.enum([
  "not_started",
  "internal_planning",
  "review_required",
]);

export const draftSubdivisionDevelopmentPreparationProfileInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  planningState: subdivisionPlanningStateSchema,
  municipalPreparationState: subdivisionCompliancePreparationStateSchema,
  registrationPreparationState: subdivisionCompliancePreparationStateSchema,
  implementationPreparationState: subdivisionImplementationPreparationStateSchema,
  responsibleInternalPartyRoleId: z.string().uuid().nullable(),
});

export type SubdivisionContext = z.infer<typeof subdivisionContextSchema>;
export type DraftSubdivisionDevelopmentInput = z.infer<typeof draftSubdivisionDevelopmentInputSchema>;
export type DraftSubdivisionBlockInput = z.infer<typeof draftSubdivisionBlockInputSchema>;
export type DraftSubdivisionLotInput = z.infer<typeof draftSubdivisionLotInputSchema>;
export type DraftSubdivisionLotInventoryStateInput = z.infer<typeof draftSubdivisionLotInventoryStateInputSchema>;
export type DraftSubdivisionBuyerClientInput = z.infer<typeof draftSubdivisionBuyerClientInputSchema>;
export type RegisterSubdivisionBuyerClientDirectInput = z.infer<typeof registerSubdivisionBuyerClientDirectInputSchema>;
export type RegisterSubdivisionClientDirectInput = z.infer<typeof registerSubdivisionClientDirectInputSchema>;
export type ArchiveSubdivisionClientInput = z.infer<typeof archiveSubdivisionClientInputSchema>;
export type RestoreSubdivisionClientInput = z.infer<typeof restoreSubdivisionClientInputSchema>;
export type DraftSubdivisionBuyerAttachmentIntentInput = z.infer<typeof draftSubdivisionBuyerAttachmentIntentInputSchema>;
export type DraftSubdivisionSaleDraftInput = z.infer<typeof draftSubdivisionSaleDraftInputSchema>;
export type DraftSubdivisionSaleDraftWorkStateInput = z.infer<typeof draftSubdivisionSaleDraftWorkStateInputSchema>;
export type DraftSubdivisionSaleDraftCoBuyerInput = z.infer<typeof draftSubdivisionSaleDraftCoBuyerInputSchema>;
export type DraftSubdivisionEconomicRuleSetInput = z.infer<typeof draftSubdivisionEconomicRuleSetInputSchema>;
export type DraftSubdivisionEconomicRuleComponentInput = z.infer<typeof draftSubdivisionEconomicRuleComponentInputSchema>;
export type DraftSubdivisionEconomicRuleComponentRoleReferenceInput = z.infer<typeof draftSubdivisionEconomicRuleComponentRoleReferenceInputSchema>;
export type DraftSubdivisionDevelopmentPreparationProfileInput = z.infer<typeof draftSubdivisionDevelopmentPreparationProfileInputSchema>;
