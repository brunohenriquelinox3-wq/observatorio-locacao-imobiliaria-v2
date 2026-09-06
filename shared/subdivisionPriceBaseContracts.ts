import { z } from "zod";
import { subdivisionContextSchema } from "./subdivisionContracts";

export const subdivisionPriceBasePolicyStateSchema = z.enum(["prepared", "submitted", "approved", "expired", "withdrawn"]);

const safeSourceFileNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[A-Za-z0-9._ -]+$/, "SOURCE_NAME_INVALID")
  .refine((name) => /\.xlsx$/i.test(name), "SOURCE_FILE_TYPE_INVALID");

// Encoded source is processed only during the request and never recorded in audit payloads or tables.
const sourceContentBase64Schema = z.string().min(16).max(2_800_000).regex(/^[A-Za-z0-9+/=]+$/, "SOURCE_CONTENT_INVALID");

export const previewSubdivisionPriceBaseSourceInputSchema = subdivisionContextSchema.extend({
  developmentId: z.string().uuid(),
  sourceFileName: safeSourceFileNameSchema,
  sourceContentBase64: sourceContentBase64Schema,
});

export const prepareSubdivisionPriceBasePolicyInputSchema = previewSubdivisionPriceBaseSourceInputSchema.extend({
  correlationId: z.string().uuid(),
  versionReference: z.string().trim().toUpperCase().regex(/^PB_[A-Z0-9_]{3,72}$/),
  effectiveFrom: z.string().date(),
});

export const prepareManualSubdivisionPriceBaseCorrectionInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  developmentId: z.string().uuid(),
  sourcePolicyId: z.string().uuid(),
  versionReference: z.string().trim().toUpperCase().regex(/^PB_[A-Z0-9_]{3,72}$/),
  effectiveFrom: z.string().date(),
  sourceRow: z.coerce.number().int().min(2).max(5_000),
  blockNumber: z.coerce.number().int().min(1).max(999),
  lotNumber: z.coerce.number().int().min(1).max(100),
  pricePerSqmBrl: z.coerce.number().finite().positive().max(1_000_000_000),
  reasonCode: z.enum(["source_correction", "internal_validation", "documented_revision"]),
  documentState: z.literal("declared_complete"),
});

export const submitSubdivisionPriceBasePolicyInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  policyId: z.string().uuid(),
});

export const approveSubdivisionPriceBasePolicyInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  policyId: z.string().uuid(),
});

export const withdrawSubdivisionPriceBasePolicyInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  policyId: z.string().uuid(),
  reasonCode: z.enum(["source_superseded", "governance_review", "effective_date_reassessment", "documentary_reconciliation"]),
});

export const listSubdivisionPriceBasePoliciesInputSchema = subdivisionContextSchema.extend({
  developmentId: z.string().uuid(),
});

/**
 * Leitura interna de referência por unidade. A autorização de MFA é aplicada
 * pelo procedimento do servidor antes de a consulta alcançar a função SQL.
 */
export const listSubdivisionLotInternalPriceReferencesInputSchema = subdivisionContextSchema.extend({
  developmentId: z.string().uuid(),
});

export type PreviewSubdivisionPriceBaseSourceInput = z.infer<typeof previewSubdivisionPriceBaseSourceInputSchema>;
export type PrepareSubdivisionPriceBasePolicyInput = z.infer<typeof prepareSubdivisionPriceBasePolicyInputSchema>;
export type PrepareManualSubdivisionPriceBaseCorrectionInput = z.infer<typeof prepareManualSubdivisionPriceBaseCorrectionInputSchema>;
export type SubmitSubdivisionPriceBasePolicyInput = z.infer<typeof submitSubdivisionPriceBasePolicyInputSchema>;
export type ApproveSubdivisionPriceBasePolicyInput = z.infer<typeof approveSubdivisionPriceBasePolicyInputSchema>;
export type WithdrawSubdivisionPriceBasePolicyInput = z.infer<typeof withdrawSubdivisionPriceBasePolicyInputSchema>;
export type ListSubdivisionPriceBasePoliciesInput = z.infer<typeof listSubdivisionPriceBasePoliciesInputSchema>;
export type ListSubdivisionLotInternalPriceReferencesInput = z.infer<typeof listSubdivisionLotInternalPriceReferencesInputSchema>;
