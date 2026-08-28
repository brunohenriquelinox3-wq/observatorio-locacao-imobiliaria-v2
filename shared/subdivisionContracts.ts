import { z } from "zod";
import { domainContextSchema } from "./domainFoundationContracts";

export const subdivisionContextSchema = domainContextSchema.extend({
  module: z.literal("loteadora"),
});

export const subdivisionDevelopmentPhaseSchema = z.enum([
  "preliminary_reference",
  "structuring",
  "review_required",
]);

export const draftSubdivisionDevelopmentInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  internalReference: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/),
  workingPhase: subdivisionDevelopmentPhaseSchema,
});

export type SubdivisionContext = z.infer<typeof subdivisionContextSchema>;
export type DraftSubdivisionDevelopmentInput = z.infer<typeof draftSubdivisionDevelopmentInputSchema>;
