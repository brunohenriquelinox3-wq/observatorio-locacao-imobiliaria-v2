import { z } from "zod";
import { subdivisionContextSchema } from "./subdivisionContracts";

const centsSchema = z.number().int().min(0).max(100_000_000_000_000).nullable();

export const lookupSubdivisionBuyerClientByFiscalReferenceInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  documentReference: z.string().trim().min(11).max(18),
}).strict();

export const openSubdivisionSaleCaseInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  lotId: z.string().uuid(),
  buyerClientId: z.string().uuid(),
}).strict();

export const addSubdivisionSaleCaseJointProponentInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  saleCaseId: z.string().uuid(),
  buyerClientId: z.string().uuid(),
}).strict();

export const removeSubdivisionSaleCaseJointProponentInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  saleCaseId: z.string().uuid(),
  buyerClientId: z.string().uuid(),
}).strict();

export const saveSubdivisionSaleCaseTermsInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  saleCaseId: z.string().uuid(),
  negotiatedTotalCents: centsSchema,
  entryAmountCents: centsSchema,
  entryDueDate: z.string().date().nullable(),
  entryInstallmentCount: z.number().int().min(0).max(480),
  entryInstallmentAmountCents: centsSchema,
  entryFirstDueDate: z.string().date().nullable(),
  entryDueDay: z.number().int().min(1).max(31).nullable(),
  installmentCount: z.number().int().min(0).max(480),
  installmentAmountCents: centsSchema,
  firstDueDate: z.string().date().nullable(),
  dueDay: z.number().int().min(1).max(31).nullable(),
  settlementMode: z.enum(["cash", "structured"]),
  cashSettlementAmountCents: centsSchema,
  cashSettlementDueDate: z.string().date().nullable(),
  supplementalAmountCents: centsSchema,
  supplementalDueDate: z.string().date().nullable(),
  tradeInCreditCents: centsSchema,
  tradeInDueDate: z.string().date().nullable(),
  tradeInCategory: z.string().trim().regex(/^[a-z][a-z0-9_]{2,47}$/).nullable(),
  tradeInDescription: z.string().trim().min(3).max(240).nullable(),
}).strict().superRefine((value, context) => {
  const hasInstallments = value.installmentCount > 0;
  if (hasInstallments && (value.installmentAmountCents === null || value.firstDueDate === null || value.dueDay === null)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_INSTALLMENT_DENIED" });
  }
  if (!hasInstallments && (value.installmentAmountCents !== null || value.firstDueDate !== null || value.dueDay !== null)) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_INSTALLMENT_DENIED" });
  }
  if ((value.entryAmountCents === null || value.entryAmountCents === 0) && value.entryDueDate !== null) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_ENTRY_DENIED" });
  }
  if (value.entryAmountCents !== null && value.entryAmountCents > 0 && value.entryDueDate === null) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_ENTRY_DENIED" });
  }
  const hasEntryInstallments = value.entryInstallmentCount > 0;
  if (hasEntryInstallments && (value.entryInstallmentAmountCents === null || value.entryFirstDueDate === null || value.entryDueDay === null)) context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_ENTRY_INSTALLMENT_DENIED" });
  if (!hasEntryInstallments && (value.entryInstallmentAmountCents !== null || value.entryFirstDueDate !== null || value.entryDueDay !== null)) context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_ENTRY_INSTALLMENT_DENIED" });
  if ((value.cashSettlementAmountCents === null || value.cashSettlementAmountCents === 0) !== (value.cashSettlementDueDate === null)) context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_CASH_DENIED" });
  if ((value.supplementalAmountCents === null || value.supplementalAmountCents === 0) !== (value.supplementalDueDate === null)) context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_SUPPLEMENTAL_DENIED" });
  if ((value.tradeInCreditCents === null || value.tradeInCreditCents === 0) !== (value.tradeInDueDate === null || value.tradeInCategory === null || value.tradeInDescription === null)) context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_TRADE_IN_DENIED" });
  if (value.entryInstallmentCount + value.installmentCount > 480) context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_SCHEDULE_LIMIT_DENIED" });
  if (value.settlementMode === "cash" && ((value.cashSettlementAmountCents ?? 0) === 0 || (value.entryAmountCents ?? 0) > 0 || value.entryInstallmentCount > 0 || value.installmentCount > 0)) context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_MODE_DENIED" });
  if (value.settlementMode === "structured" && ((value.cashSettlementAmountCents ?? 0) > 0 || ((value.entryAmountCents ?? 0) === 0 && value.entryInstallmentCount === 0 && value.installmentCount === 0))) context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_MODE_DENIED" });
  const composedTotal = (value.entryAmountCents ?? 0) + value.entryInstallmentCount * (value.entryInstallmentAmountCents ?? 0) + value.installmentCount * (value.installmentAmountCents ?? 0) + (value.cashSettlementAmountCents ?? 0) + (value.supplementalAmountCents ?? 0) + (value.tradeInCreditCents ?? 0);
  if (value.negotiatedTotalCents === null || value.negotiatedTotalCents <= 0 || composedTotal !== value.negotiatedTotalCents) context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_TERMS_TOTAL_DENIED" });
});

export const formalizeSubdivisionSaleCaseInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  saleCaseId: z.string().uuid(),
}).strict();

export const approveSubdivisionSaleCaseInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  saleCaseId: z.string().uuid(),
}).strict();

export const requestSubdivisionSaleReversalInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  saleCaseId: z.string().uuid(),
}).strict();

export const releaseSubdivisionInternalReceivableBatchInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  saleCaseId: z.string().uuid(),
}).strict();

export const configureSubdivisionInternalReceivableAlertsInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  leadDays: z.number().int().min(1).max(14),
}).strict();

export const manageSubdivisionInternalReceivableAlertScheduleInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  action: z.enum(["activate", "pause", "resume", "remove"]),
}).strict();

export const createSubdivisionSaleCaseDocumentIntentInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  saleCaseId: z.string().uuid(),
  documentCategory: z.string().trim().regex(/^[a-z][a-z0-9_]{2,47}$/),
}).strict();

export const setSubdivisionSaleCaseDossierReviewInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  saleCaseId: z.string().uuid(),
  dossierReady: z.boolean(),
  reasonCode: z.string().trim().regex(/^[a-z][a-z0-9_]{2,47}$/).nullable(),
}).strict().superRefine((value, context) => { if (value.dossierReady && value.reasonCode !== null) context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_DOSSIER_REVIEW_DENIED" }); if (!value.dossierReady && value.reasonCode === null) context.addIssue({ code: z.ZodIssueCode.custom, message: "SUBDIVISION_SALE_CASE_DOSSIER_REVIEW_DENIED" }); });

export type LookupSubdivisionBuyerClientByFiscalReferenceInput = z.infer<typeof lookupSubdivisionBuyerClientByFiscalReferenceInputSchema>;
export type OpenSubdivisionSaleCaseInput = z.infer<typeof openSubdivisionSaleCaseInputSchema>;
export type AddSubdivisionSaleCaseJointProponentInput = z.infer<typeof addSubdivisionSaleCaseJointProponentInputSchema>;
export type RemoveSubdivisionSaleCaseJointProponentInput = z.infer<typeof removeSubdivisionSaleCaseJointProponentInputSchema>;
export type SaveSubdivisionSaleCaseTermsInput = z.infer<typeof saveSubdivisionSaleCaseTermsInputSchema>;
export type FormalizeSubdivisionSaleCaseInput = z.infer<typeof formalizeSubdivisionSaleCaseInputSchema>;
export type ApproveSubdivisionSaleCaseInput = z.infer<typeof approveSubdivisionSaleCaseInputSchema>;
export type RequestSubdivisionSaleReversalInput = z.infer<typeof requestSubdivisionSaleReversalInputSchema>;
export type ReleaseSubdivisionInternalReceivableBatchInput = z.infer<typeof releaseSubdivisionInternalReceivableBatchInputSchema>;
export type ConfigureSubdivisionInternalReceivableAlertsInput = z.infer<typeof configureSubdivisionInternalReceivableAlertsInputSchema>;
export type ManageSubdivisionInternalReceivableAlertScheduleInput = z.infer<typeof manageSubdivisionInternalReceivableAlertScheduleInputSchema>;
export type CreateSubdivisionSaleCaseDocumentIntentInput = z.infer<typeof createSubdivisionSaleCaseDocumentIntentInputSchema>;
export type SetSubdivisionSaleCaseDossierReviewInput = z.infer<typeof setSubdivisionSaleCaseDossierReviewInputSchema>;
