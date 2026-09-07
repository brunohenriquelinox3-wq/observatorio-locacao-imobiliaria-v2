import { z } from "zod";
import { subdivisionContextSchema } from "./subdivisionContracts";

export const subdivisionParticipationScheduleKindSchema = z.enum(["entry", "entry_installment", "installment", "cash_settlement", "supplemental_cash", "trade_in_credit"]);
export const subdivisionParticipationAllocationMethodSchema = z.enum(["percentage_per_schedule", "fixed_per_schedule", "capped_total_per_lot"]);

export const upsertSubdivisionInternalPartyProfileInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(), partyRoleAssignmentId: z.string().uuid(), documentReference: z.string().regex(/^(?:\d{11}|\d{14})$/),
});
export const lookupSubdivisionInternalPartyByFiscalReferenceInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(), developmentId: z.string().uuid(), documentReference: z.string().regex(/^(?:\d{11}|\d{14})$/),
});
export const createSubdivisionParticipationPolicyVersionInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(), developmentId: z.string().uuid(), validFrom: z.string().date(), validUntil: z.string().date().nullable(), requireFullAllocation: z.boolean(),
}).superRefine((value, ctx) => { if (value.validUntil && value.validUntil < value.validFrom) ctx.addIssue({ code: "custom", path: ["validUntil"], message: "A vigência final não pode anteceder o início." }); });
export const addSubdivisionParticipationPolicyRuleInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(), policyVersionId: z.string().uuid(), internalPartyRoleLinkId: z.string().uuid(), allocationMethod: subdivisionParticipationAllocationMethodSchema,
  percentageBasisPoints: z.number().int().min(1).max(10000).nullable(), fixedAmountCents: z.number().int().min(1).max(100000000000000).nullable(), capTotalCents: z.number().int().min(1).max(100000000000000).nullable(), appliesToAllLots: z.boolean(), scheduleKinds: z.array(subdivisionParticipationScheduleKindSchema).min(1).max(6),
}).superRefine((value, ctx) => {
  const methodValues = [value.percentageBasisPoints, value.fixedAmountCents, value.capTotalCents].filter((item) => item !== null).length;
  const expected = value.allocationMethod === "percentage_per_schedule" ? value.percentageBasisPoints : value.allocationMethod === "fixed_per_schedule" ? value.fixedAmountCents : value.capTotalCents;
  if (methodValues !== 1 || expected === null) ctx.addIssue({ code: "custom", path: ["allocationMethod"], message: "Informe somente o valor correspondente ao método de projeção." });
});
export const addSubdivisionParticipationRuleLotScopeInputSchema = subdivisionContextSchema.extend({ correlationId: z.string().uuid(), ruleId: z.string().uuid(), lotId: z.string().uuid() });
export const activateSubdivisionParticipationPolicyVersionInputSchema = subdivisionContextSchema.extend({ correlationId: z.string().uuid(), policyVersionId: z.string().uuid() });

export type UpsertSubdivisionInternalPartyProfileInput = z.infer<typeof upsertSubdivisionInternalPartyProfileInputSchema>;
export type LookupSubdivisionInternalPartyByFiscalReferenceInput = z.infer<typeof lookupSubdivisionInternalPartyByFiscalReferenceInputSchema>;
export type CreateSubdivisionParticipationPolicyVersionInput = z.infer<typeof createSubdivisionParticipationPolicyVersionInputSchema>;
export type AddSubdivisionParticipationPolicyRuleInput = z.infer<typeof addSubdivisionParticipationPolicyRuleInputSchema>;
