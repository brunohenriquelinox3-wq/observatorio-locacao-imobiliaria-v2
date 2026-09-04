import { z } from "zod";
import { urbanSalesContextSchema } from "./urbanPipelineContracts";

export const urbanDevelopmentKindSchema = z.enum(["condominium", "tower", "mixed_use", "single_building", "other"]);
export const urbanDevelopmentPhaseSchema = z.enum(["reference", "structuring", "review_required"]);
export const urbanDeveloperRelationshipSchema = z.enum(["development_responsible", "commercial_reference", "other"]);

export const draftUrbanDevelopmentInputSchema = urbanSalesContextSchema.extend({
  correlationId: z.string().uuid(),
  internalReference: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/),
  developmentKind: urbanDevelopmentKindSchema,
  workingPhase: urbanDevelopmentPhaseSchema,
});

export type DraftUrbanDevelopmentInput = z.infer<typeof draftUrbanDevelopmentInputSchema>;

export const draftUrbanDeveloperInputSchema = urbanSalesContextSchema.extend({
  correlationId: z.string().uuid(),
  partyId: z.string().uuid(),
});

export const draftUrbanDevelopmentDeveloperLinkInputSchema = urbanSalesContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  developerProfileId: z.string().uuid(),
  relationship: urbanDeveloperRelationshipSchema,
});

export type DraftUrbanDeveloperInput = z.infer<typeof draftUrbanDeveloperInputSchema>;
export type DraftUrbanDevelopmentDeveloperLinkInput = z.infer<typeof draftUrbanDevelopmentDeveloperLinkInputSchema>;
