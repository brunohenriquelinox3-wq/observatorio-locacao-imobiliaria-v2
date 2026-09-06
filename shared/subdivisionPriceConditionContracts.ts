import { z } from "zod";
import { subdivisionContextSchema } from "./subdivisionContracts";

export const subdivisionPriceConditionScopeSchema = z.enum(["development", "block", "lot"]);
export const subdivisionPriceConditionKindSchema = z.enum(["override_per_sqm", "percentage_adjustment", "temporary_discount"]);
export const subdivisionPriceConditionDocumentStateSchema = z.enum(["pending_evidence", "under_review", "declared_complete", "review_required"]);
export const subdivisionPriceConditionStateSchema = z.enum(["prepared", "submitted", "approved", "expired", "withdrawn"]);
export const subdivisionPriceConditionReasonSchema = z.enum(["internal_review", "work_progress", "market_response", "campaign", "specific_condition", "other"]);

const conditionTargetSchema = z.object({
  scope: subdivisionPriceConditionScopeSchema,
  blockId: z.string().uuid().nullable(),
  lotNumber: z.number().int().positive().max(999).nullable(),
}).superRefine((value, context) => {
  if (value.scope === "development" && (value.blockId || value.lotNumber)) context.addIssue({ code: "custom", message: "PRICE_CONDITION_TARGET_INVALID" });
  if (value.scope === "block" && (!value.blockId || value.lotNumber)) context.addIssue({ code: "custom", message: "PRICE_CONDITION_TARGET_INVALID" });
  if (value.scope === "lot" && (!value.blockId || !value.lotNumber)) context.addIssue({ code: "custom", message: "PRICE_CONDITION_TARGET_INVALID" });
});

export const createSubdivisionPriceConditionInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  basePolicyId: z.string().uuid(),
  conditionReference: z.string().trim().toUpperCase().regex(/^PC_[A-Z0-9_]{3,72}$/),
  adjustmentKind: subdivisionPriceConditionKindSchema,
  amount: z.number().finite().min(-99.99).max(1_000_000_000).refine((value) => value !== 0, "PRICE_CONDITION_AMOUNT_INVALID"),
  effectiveFrom: z.string().date(),
  effectiveUntil: z.string().date().nullable(),
  reasonCode: subdivisionPriceConditionReasonSchema,
  documentState: subdivisionPriceConditionDocumentStateSchema,
}).and(conditionTargetSchema).superRefine((value, context) => {
  if (value.effectiveUntil && value.effectiveUntil <= value.effectiveFrom) context.addIssue({ code: "custom", message: "PRICE_CONDITION_VIGENCY_INVALID" });
  if (value.adjustmentKind === "temporary_discount" && !value.effectiveUntil) context.addIssue({ code: "custom", message: "PRICE_CONDITION_END_REQUIRED" });
  if (value.adjustmentKind === "override_per_sqm" && value.amount <= 0) context.addIssue({ code: "custom", message: "PRICE_CONDITION_AMOUNT_INVALID" });
  if (value.adjustmentKind === "temporary_discount" && (value.amount <= 0 || value.amount > 100)) context.addIssue({ code: "custom", message: "PRICE_CONDITION_DISCOUNT_INVALID" });
  if (value.adjustmentKind === "percentage_adjustment" && (value.amount <= -100 || value.amount > 1000 || value.amount === 0)) context.addIssue({ code: "custom", message: "PRICE_CONDITION_PERCENTAGE_INVALID" });
});

export const listSubdivisionPriceConditionsInputSchema = subdivisionContextSchema.extend({ developmentId: z.string().uuid() });
export const getSubdivisionLotPriceContextInputSchema = subdivisionContextSchema.extend({ developmentId: z.string().uuid(), blockId: z.string().uuid(), lotNumber: z.number().int().positive().max(999) });
export const submitSubdivisionPriceConditionInputSchema = subdivisionContextSchema.extend({ correlationId: z.string().uuid(), conditionId: z.string().uuid() });
export const approveSubdivisionPriceConditionInputSchema = subdivisionContextSchema.extend({ correlationId: z.string().uuid(), conditionId: z.string().uuid() });
export const withdrawSubdivisionPriceConditionInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  conditionId: z.string().uuid(),
  reasonCode: z.enum(["source_superseded", "governance_review", "effective_date_reassessment", "documentary_reconciliation"]),
});

export type CreateSubdivisionPriceConditionInput = z.infer<typeof createSubdivisionPriceConditionInputSchema>;
export type ListSubdivisionPriceConditionsInput = z.infer<typeof listSubdivisionPriceConditionsInputSchema>;
export type GetSubdivisionLotPriceContextInput = z.infer<typeof getSubdivisionLotPriceContextInputSchema>;
export type SubmitSubdivisionPriceConditionInput = z.infer<typeof submitSubdivisionPriceConditionInputSchema>;
export type ApproveSubdivisionPriceConditionInput = z.infer<typeof approveSubdivisionPriceConditionInputSchema>;
export type WithdrawSubdivisionPriceConditionInput = z.infer<typeof withdrawSubdivisionPriceConditionInputSchema>;
