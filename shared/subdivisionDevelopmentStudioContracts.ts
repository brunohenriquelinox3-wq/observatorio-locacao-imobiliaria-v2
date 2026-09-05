import { z } from "zod";
import { subdivisionContextSchema, subdivisionDevelopmentPhaseSchema } from "./subdivisionContracts";

export const subdivisionDevelopmentKindSchema = z.enum([
  "residential",
  "mixed_use",
  "commercial",
  "industrial",
  "rural",
  "other",
]);

export const subdivisionDevelopmentAttachmentCategorySchema = z.enum([
  "planning",
  "municipal",
  "registry",
  "implementation",
  "environmental",
  "other",
]);

const internalReferenceSchema = z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/);
const displayNameSchema = z.string().trim().min(3).max(120);
const municipalitySchema = z.string().trim().min(2).max(80).nullable();
const stateCodeSchema = z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/).nullable();
const internalNoteSchema = z.string().trim().max(600).nullable();

const studioFieldsSchema = z.object({
  internalReference: internalReferenceSchema,
  displayName: displayNameSchema,
  developmentKind: subdivisionDevelopmentKindSchema,
  municipality: municipalitySchema,
  stateCode: stateCodeSchema,
  plannedStageCount: z.number().int().min(1).max(20),
  workingPhase: subdivisionDevelopmentPhaseSchema,
  internalNote: internalNoteSchema,
}).superRefine((value, ctx) => {
  if ((value.municipality === null) !== (value.stateCode === null)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["municipality"], message: "Município e UF devem ser informados juntos ou deixados em branco." });
  }
});

export const createSubdivisionDevelopmentStudioInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
}).merge(studioFieldsSchema);

export const updateSubdivisionDevelopmentStudioInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
}).merge(studioFieldsSchema);

export const archiveSubdivisionDevelopmentStudioInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
});

export const createSubdivisionDevelopmentAttachmentIntentInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  category: subdivisionDevelopmentAttachmentCategorySchema,
});

export const archiveSubdivisionDevelopmentAttachmentInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  attachmentId: z.string().uuid(),
});

export type CreateSubdivisionDevelopmentStudioInput = z.infer<typeof createSubdivisionDevelopmentStudioInputSchema>;
export type UpdateSubdivisionDevelopmentStudioInput = z.infer<typeof updateSubdivisionDevelopmentStudioInputSchema>;
export type ArchiveSubdivisionDevelopmentStudioInput = z.infer<typeof archiveSubdivisionDevelopmentStudioInputSchema>;
export type CreateSubdivisionDevelopmentAttachmentIntentInput = z.infer<typeof createSubdivisionDevelopmentAttachmentIntentInputSchema>;
export type ArchiveSubdivisionDevelopmentAttachmentInput = z.infer<typeof archiveSubdivisionDevelopmentAttachmentInputSchema>;
