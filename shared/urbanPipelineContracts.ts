import { z } from "zod";
import { domainContextSchema } from "./domainFoundationContracts";

export const urbanLeadStageSchema = z.enum(["intake", "qualification", "agenda_pending", "scheduled", "closed_lost"]);
export const urbanAgendaStateSchema = z.enum(["scheduled", "rescheduled", "cancelled", "occurred", "not_held"]);
export const urbanSalesContextSchema = domainContextSchema.extend({ module: z.literal("vendas_urbanas") });

export const draftUrbanLeadInputSchema = urbanSalesContextSchema.extend({
  correlationId: z.string().uuid(),
  partyId: z.string().uuid(),
  sourceCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/),
  interestKind: z.enum(["urban_asset", "search_profile", "unspecified"]).default("unspecified"),
});

export const urbanLeadStageInputSchema = urbanSalesContextSchema.extend({
  correlationId: z.string().uuid(),
  leadId: z.string().uuid(),
  nextStage: urbanLeadStageSchema,
  reasonCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/).optional(),
}).superRefine((value, context) => {
  if (value.nextStage === "closed_lost" && !value.reasonCode) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["reasonCode"], message: "Encerramento sem ganho exige motivo em código." });
  }
});

export const draftUrbanAgendaInputSchema = urbanSalesContextSchema.extend({
  correlationId: z.string().uuid(),
  leadId: z.string().uuid(),
  scheduledFor: z.string().datetime(),
  state: urbanAgendaStateSchema.default("scheduled"),
  reasonCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/).optional(),
}).superRefine((value, context) => {
  if (["cancelled", "not_held"].includes(value.state) && !value.reasonCode) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["reasonCode"], message: "Cancelamento ou não realização exige motivo em código." });
  }
});

export const urbanLeadAssetLinkInputSchema = urbanSalesContextSchema.extend({
  correlationId: z.string().uuid(),
  leadId: z.string().uuid(),
  assetId: z.string().uuid(),
});

export const urbanSearchTimingSchema = z.enum(["immediate", "up_to_90_days", "flexible"]);
export const draftUrbanLeadSearchProfileInputSchema = urbanSalesContextSchema.extend({
  correlationId: z.string().uuid(),
  leadId: z.string().uuid(),
  acceptedAssetKinds: z.array(z.enum(["apartment", "house", "kitnet", "commercial_unit", "urban_lot", "building", "other_urban_asset"]))
    .min(1).max(7).refine((values) => new Set(values).size === values.length, "Tipos de ativo não podem se repetir."),
  searchTiming: urbanSearchTimingSchema,
  preferenceCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/).optional(),
});

export type DraftUrbanLeadInput = z.infer<typeof draftUrbanLeadInputSchema>;
export type UrbanLeadStageInput = z.infer<typeof urbanLeadStageInputSchema>;
export type DraftUrbanAgendaInput = z.infer<typeof draftUrbanAgendaInputSchema>;
export type UrbanLeadAssetLinkInput = z.infer<typeof urbanLeadAssetLinkInputSchema>;
export type DraftUrbanLeadSearchProfileInput = z.infer<typeof draftUrbanLeadSearchProfileInputSchema>;
