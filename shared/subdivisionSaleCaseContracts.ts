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
  installmentCount: z.number().int().min(0).max(480),
  installmentAmountCents: centsSchema,
  firstDueDate: z.string().date().nullable(),
  dueDay: z.number().int().min(1).max(31).nullable(),
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
