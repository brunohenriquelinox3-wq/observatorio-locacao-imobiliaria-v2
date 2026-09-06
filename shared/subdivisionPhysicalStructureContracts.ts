import { z } from "zod";
import { subdivisionContextSchema } from "./subdivisionContracts";

const optionalShortText = z.string().trim().min(1).max(80).nullable().optional();
const optionalDimension = z.number().finite().positive().max(1_000_000).nullable().optional();

export const subdivisionBlockTypologySchema = z.enum(["regular", "mixed", "irregular", "other"]);
export const subdivisionLotTypologySchema = z.enum(["standard", "corner", "irregular", "other"]);
export const subdivisionLotPositionSchema = z.enum(["not_declared", "internal", "corner", "end"]);
export const subdivisionLotPhysicalReservationPurposeSchema = z.enum(["landowner_reserve", "technical_artesian_well", "technical_water_tank", "technical_other"]);

export const subdivisionPhysicalLotSchema = z.object({
  lotNumber: z.number().int().min(1).max(100),
  areaSqm: optionalDimension,
  frontageM: optionalDimension,
  depthM: optionalDimension,
  lotTypology: subdivisionLotTypologySchema.default("standard"),
  positionCode: subdivisionLotPositionSchema.default("not_declared"),
});

export const subdivisionPhysicalBlockSchema = z.object({
  blockNumber: z.number().int().min(1).max(999),
  sectorReference: optionalShortText,
  blockTypology: subdivisionBlockTypologySchema.default("regular"),
  lots: z.array(subdivisionPhysicalLotSchema).min(1).max(100),
}).superRefine((block, ctx) => {
  const seen = new Set<number>();
  block.lots.forEach((lot, index) => {
    if (seen.has(lot.lotNumber)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["lots", index, "lotNumber"], message: "Cada Lote deve ter numeração única dentro da Quadra." });
    }
    seen.add(lot.lotNumber);
  });
});

export const applySubdivisionPhysicalStructureInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  blocks: z.array(subdivisionPhysicalBlockSchema).min(1).max(50),
  replaceExisting: z.boolean(),
}).superRefine((value, ctx) => {
  const seen = new Set<number>();
  value.blocks.forEach((block, index) => {
    if (seen.has(block.blockNumber)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["blocks", index, "blockNumber"], message: "Cada Quadra deve ter numeração única neste loteamento." });
    }
    seen.add(block.blockNumber);
  });
});

export const subdivisionRequirementCodeSchema = z.enum([
  "municipal_approval",
  "municipal_technical_project",
  "registry_matriculation",
  "registry_memorial",
  "legal_review",
  "legal_registration",
  "works_infrastructure",
  "works_access",
  "environmental_license",
  "technical_survey",
  "technical_layout",
]);
export const subdivisionRequirementStateSchema = z.enum(["not_started", "pending_evidence", "under_review", "declared_complete", "review_required"]);

export const upsertSubdivisionDevelopmentRequirementInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  requirementCode: subdivisionRequirementCodeSchema,
  requirementState: subdivisionRequirementStateSchema,
});

export const upsertSubdivisionLotPhysicalReservationInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  blockId: z.string().uuid(),
  lotNumber: z.number().int().min(1).max(100),
  reservationPurpose: subdivisionLotPhysicalReservationPurposeSchema,
});

export type ApplySubdivisionPhysicalStructureInput = z.infer<typeof applySubdivisionPhysicalStructureInputSchema>;
export type SubdivisionPhysicalBlock = z.infer<typeof subdivisionPhysicalBlockSchema>;
export type SubdivisionPhysicalLot = z.infer<typeof subdivisionPhysicalLotSchema>;
export type UpsertSubdivisionDevelopmentRequirementInput = z.infer<typeof upsertSubdivisionDevelopmentRequirementInputSchema>;
export type UpsertSubdivisionLotPhysicalReservationInput = z.infer<typeof upsertSubdivisionLotPhysicalReservationInputSchema>;
