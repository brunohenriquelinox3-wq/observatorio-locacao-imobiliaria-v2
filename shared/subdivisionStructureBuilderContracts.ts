import { z } from "zod";
import { subdivisionContextSchema } from "./subdivisionContracts";

export const subdivisionStructureBlockSchema = z.object({
  blockNumber: z.number().int().min(1).max(999),
  lotCount: z.number().int().min(1).max(100),
});

export const applySubdivisionDraftStructureInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  blocks: z.array(subdivisionStructureBlockSchema).min(1).max(50),
  replaceExisting: z.boolean(),
}).superRefine((value, ctx) => {
  const seen = new Set<number>();
  value.blocks.forEach((block, index) => {
    if (seen.has(block.blockNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["blocks", index, "blockNumber"],
        message: "Cada Quadra deve ter uma numeração única neste loteamento.",
      });
    }
    seen.add(block.blockNumber);
  });
});

export const archiveSubdivisionDraftBlockInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  blockId: z.string().uuid(),
});

export const restoreSubdivisionDraftBlockInputSchema = archiveSubdivisionDraftBlockInputSchema;

export type ApplySubdivisionDraftStructureInput = z.infer<typeof applySubdivisionDraftStructureInputSchema>;
export type SubdivisionStructureBlock = z.infer<typeof subdivisionStructureBlockSchema>;
export type ArchiveSubdivisionDraftBlockInput = z.infer<typeof archiveSubdivisionDraftBlockInputSchema>;
export type RestoreSubdivisionDraftBlockInput = z.infer<typeof restoreSubdivisionDraftBlockInputSchema>;
