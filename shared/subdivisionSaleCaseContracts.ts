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

export const saveSubdivisionSaleCaseTermsInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  saleCaseId: z.string().uuid(),
  negotiatedTotalCents: centsSchema,
  entryAmountCents: centsSchema,
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
});

export type LookupSubdivisionBuyerClientByFiscalReferenceInput = z.infer<typeof lookupSubdivisionBuyerClientByFiscalReferenceInputSchema>;
export type OpenSubdivisionSaleCaseInput = z.infer<typeof openSubdivisionSaleCaseInputSchema>;
export type SaveSubdivisionSaleCaseTermsInput = z.infer<typeof saveSubdivisionSaleCaseTermsInputSchema>;
