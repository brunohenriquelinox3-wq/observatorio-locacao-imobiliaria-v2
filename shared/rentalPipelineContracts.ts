import { z } from "zod";
import { domainContextSchema } from "./domainFoundationContracts";

export const rentalOperatingContextSchema = domainContextSchema.extend({ module: z.literal("locacao") });

export const rentalJourneyKindSchema = z.enum(["management_interest", "tenant_interest"]);
export const rentalIntakeStageSchema = z.enum(["intake", "qualification", "agenda_pending", "scheduled", "closed_lost"]);
export const rentalAgendaStateSchema = z.enum(["scheduled", "rescheduled", "cancelled", "occurred", "not_held"]);
export const rentalSearchOccupancyTimingSchema = z.enum(["immediate", "up_to_30_days", "flexible"]);
export const rentalManagementServiceScopeSchema = z.enum(["full_administration_interest", "tenant_search_interest", "undecided"]);
export const urbanAssetKindSchema = z.enum(["apartment", "house", "kitnet", "commercial_unit", "urban_lot", "building", "other_urban_asset"]);

export const draftRentalIntakeInputSchema = rentalOperatingContextSchema.extend({
  correlationId: z.string().uuid(),
  partyId: z.string().uuid(),
  journeyKind: rentalJourneyKindSchema,
  sourceCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/),
});

export const rentalIntakeStageInputSchema = rentalOperatingContextSchema.extend({
  correlationId: z.string().uuid(),
  intakeId: z.string().uuid(),
  nextStage: rentalIntakeStageSchema,
  reasonCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/).optional(),
}).superRefine((value, context) => {
  if (value.nextStage === "closed_lost" && !value.reasonCode) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["reasonCode"], message: "Encerramento sem ganho exige motivo em código." });
  }
});

export const draftRentalAgendaInputSchema = rentalOperatingContextSchema.extend({
  correlationId: z.string().uuid(),
  intakeId: z.string().uuid(),
  scheduledFor: z.string().datetime(),
  state: rentalAgendaStateSchema.default("scheduled"),
  reasonCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/).optional(),
}).superRefine((value, context) => {
  if (["cancelled", "not_held"].includes(value.state) && !value.reasonCode) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["reasonCode"], message: "Cancelamento ou não realização exige motivo em código." });
  }
});

export const rentalManagementAssetLinkInputSchema = rentalOperatingContextSchema.extend({
  correlationId: z.string().uuid(),
  intakeId: z.string().uuid(),
  assetId: z.string().uuid(),
});

export const draftRentalTenantSearchProfileInputSchema = rentalOperatingContextSchema.extend({
  correlationId: z.string().uuid(),
  intakeId: z.string().uuid(),
  acceptedAssetKinds: z.array(urbanAssetKindSchema).min(1).max(4),
  occupancyTiming: rentalSearchOccupancyTimingSchema,
  preferenceCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/),
});

export const draftRentalManagementScopeInputSchema = rentalOperatingContextSchema.extend({
  correlationId: z.string().uuid(),
  intakeId: z.string().uuid(),
  declaredScope: rentalManagementServiceScopeSchema,
  internalNoteCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/).optional(),
});

export type DraftRentalIntakeInput = z.infer<typeof draftRentalIntakeInputSchema>;
export type RentalIntakeStageInput = z.infer<typeof rentalIntakeStageInputSchema>;
export type DraftRentalAgendaInput = z.infer<typeof draftRentalAgendaInputSchema>;
export type RentalManagementAssetLinkInput = z.infer<typeof rentalManagementAssetLinkInputSchema>;
export type DraftRentalTenantSearchProfileInput = z.infer<typeof draftRentalTenantSearchProfileInputSchema>;
export type DraftRentalManagementScopeInput = z.infer<typeof draftRentalManagementScopeInputSchema>;
