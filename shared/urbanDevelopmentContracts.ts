import { z } from "zod";
import { urbanSalesContextSchema } from "./urbanPipelineContracts";

export const urbanDevelopmentKindSchema = z.enum(["condominium", "tower", "mixed_use", "single_building", "other"]);
export const urbanDevelopmentPhaseSchema = z.enum(["reference", "structuring", "review_required"]);

export const draftUrbanDevelopmentInputSchema = urbanSalesContextSchema.extend({
  correlationId: z.string().uuid(),
  internalReference: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/),
  developmentKind: urbanDevelopmentKindSchema,
  workingPhase: urbanDevelopmentPhaseSchema,
});

export type DraftUrbanDevelopmentInput = z.infer<typeof draftUrbanDevelopmentInputSchema>;
