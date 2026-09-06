import { z } from "zod";
import { domainContextSchema, partyKindSchema } from "./domainFoundationContracts";

export const clientImportRoleSchema = z.enum(["client", "buyer"]);

export const clientImportRowSchema = z.object({
  displayName: z.string().trim().min(2).max(160),
  kind: partyKindSchema,
  role: clientImportRoleSchema,
});

export const clientImportRowsSchema = z.array(clientImportRowSchema).min(1).max(200).superRefine((rows, context) => {
  const seen = new Set<string>();
  rows.forEach((row, index) => {
    const key = `${row.displayName.trim().toLocaleLowerCase("pt-BR")}::${row.kind}::${row.role}`;
    if (seen.has(key)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index, "displayName"],
        message: "A planilha contém cliente repetido para o mesmo tipo e papel.",
      });
    }
    seen.add(key);
  });
});

export const clientImportCommitInputSchema = domainContextSchema.extend({
  correlationId: z.string().uuid(),
  fileFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
  confirmation: z.literal("CONFIRMO_IMPORTACAO"),
  privacyNoticeVersion: z.literal("IMPORTACAO_MINIMA_V1"),
  retentionPurpose: z.literal("CADASTRO_RASCUNHO_COM_REVISAO_HUMANA"),
  rows: clientImportRowsSchema,
});

export type ClientImportRow = z.infer<typeof clientImportRowSchema>;
export type ClientImportCommitInput = z.infer<typeof clientImportCommitInputSchema>;
