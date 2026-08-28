import { z } from "zod";
import { domainContextSchema } from "./domainFoundationContracts";

export const urbanAssetKindSchema = z.enum([
  "apartment",
  "house",
  "kitnet",
  "commercial_unit",
  "urban_lot",
  "building",
  "other_urban_asset",
]);
export const assetLifecycleStateSchema = z.enum(["draft", "preparing", "eligible", "blocked", "withdrawn"]);
export const assetPartyRelationSchema = z.enum(["ownership_claim", "management_authority"]);

export const draftUrbanAssetInputSchema = domainContextSchema.extend({
  correlationId: z.string().uuid(),
  kind: urbanAssetKindSchema,
  referenceLabel: z.string().trim().min(2).max(160),
  internalReference: z.string().trim().toUpperCase().regex(/^[A-Z0-9][A-Z0-9_-]{1,63}$/),
});

export const draftAssetPartyRelationInputSchema = domainContextSchema.extend({
  correlationId: z.string().uuid(),
  assetId: z.string().uuid(),
  partyId: z.string().uuid(),
  relation: assetPartyRelationSchema,
  beginsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
}).superRefine((value, context) => {
  if (value.beginsAt && value.endsAt && new Date(value.endsAt) <= new Date(value.beginsAt)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["endsAt"], message: "A vigência final deve ocorrer após o início." });
  }
});

export const draftAssetModuleStateInputSchema = domainContextSchema.extend({
  correlationId: z.string().uuid(),
  assetId: z.string().uuid(),
  state: assetLifecycleStateSchema,
  reasonCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/).optional(),
}).superRefine((value, context) => {
  if (value.state === "blocked" && !value.reasonCode) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["reasonCode"], message: "Estado bloqueado exige motivo em código." });
  }
});

export type DraftUrbanAssetInput = z.infer<typeof draftUrbanAssetInputSchema>;
export type DraftAssetPartyRelationInput = z.infer<typeof draftAssetPartyRelationInputSchema>;
export type DraftAssetModuleStateInput = z.infer<typeof draftAssetModuleStateInputSchema>;
