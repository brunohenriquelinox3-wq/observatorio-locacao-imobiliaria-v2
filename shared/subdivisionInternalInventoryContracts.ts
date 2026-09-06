import { z } from "zod";
import { subdivisionContextSchema } from "./subdivisionContracts";

export const internalInventoryClassificationSchema = z.enum(["standard", "attention", "technical"]);
export const internalInventoryReviewStateSchema = z.enum(["not_reviewed", "reviewed", "needs_review"]);
export const internalInventoryMapLegendSchema = z.enum(["base", "attention", "technical"]);

export const listSubdivisionLotInternalInventoryProfilesInputSchema = subdivisionContextSchema.extend({
  developmentId: z.string().uuid(),
});

export const upsertSubdivisionLotInternalInventoryProfileInputSchema = listSubdivisionLotInternalInventoryProfilesInputSchema.extend({
  blockId: z.string().uuid(),
  lotNumber: z.number().int().min(1).max(999),
  inventoryClassification: internalInventoryClassificationSchema,
  reviewState: internalInventoryReviewStateSchema,
  mapLegend: internalInventoryMapLegendSchema,
  internalNote: z.string().trim().max(280),
  correlationId: z.string().uuid(),
});

export type UpsertSubdivisionLotInternalInventoryProfileInput = z.infer<typeof upsertSubdivisionLotInternalInventoryProfileInputSchema>;
