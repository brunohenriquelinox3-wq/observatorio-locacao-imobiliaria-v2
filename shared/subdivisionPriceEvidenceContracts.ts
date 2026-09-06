import { z } from "zod";
import { subdivisionContextSchema } from "./subdivisionContracts";

export const priceEvidenceSubjectKindSchema = z.enum(["price_base_policy", "price_condition"]);

const priceEvidenceContextSchema = subdivisionContextSchema.extend({
  developmentId: z.string().uuid(),
});

export const listSubdivisionPriceEvidenceSummaryInputSchema = priceEvidenceContextSchema;

export const linkSubdivisionPriceEvidenceInputSchema = priceEvidenceContextSchema.extend({
  attachmentId: z.string().uuid(),
  subjectKind: priceEvidenceSubjectKindSchema,
  subjectId: z.string().uuid(),
  correlationId: z.string().uuid(),
});

export const archiveSubdivisionPriceEvidenceLinkInputSchema = priceEvidenceContextSchema.extend({
  evidenceLinkId: z.string().uuid(),
  correlationId: z.string().uuid(),
});

export type ListSubdivisionPriceEvidenceSummaryInput = z.infer<typeof listSubdivisionPriceEvidenceSummaryInputSchema>;
export type LinkSubdivisionPriceEvidenceInput = z.infer<typeof linkSubdivisionPriceEvidenceInputSchema>;
export type ArchiveSubdivisionPriceEvidenceLinkInput = z.infer<typeof archiveSubdivisionPriceEvidenceLinkInputSchema>;
