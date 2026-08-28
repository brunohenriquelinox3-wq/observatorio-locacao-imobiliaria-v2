import { z } from "zod";

export const operatingModuleSchema = z.enum(["vendas_urbanas", "locacao", "loteadora"]);
export const partyKindSchema = z.enum(["individual", "legal_entity"]);
export const partyRoleSchema = z.enum([
  "lead",
  "client",
  "buyer",
  "seller",
  "owner",
  "tenant",
  "guarantor",
  "representative",
  "broker",
  "provider",
]);

export const domainContextSchema = z.object({
  organizationId: z.string().uuid(),
  module: operatingModuleSchema,
  purposeCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/),
});

export const draftPartyInputSchema = domainContextSchema.extend({
  correlationId: z.string().uuid(),
  kind: partyKindSchema,
  displayName: z.string().trim().min(2).max(160),
  sourceKind: z.enum(["operator_declaration", "import_preview"]).default("operator_declaration"),
});

export const draftPartyRoleInputSchema = domainContextSchema.extend({
  correlationId: z.string().uuid(),
  partyId: z.string().uuid(),
  role: partyRoleSchema,
  beginsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
}).superRefine((value, context) => {
  if (value.beginsAt && value.endsAt && new Date(value.endsAt) <= new Date(value.beginsAt)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["endsAt"], message: "A vigência final deve ocorrer após o início." });
  }
});

export type DomainContext = z.infer<typeof domainContextSchema>;
export type DraftPartyInput = z.infer<typeof draftPartyInputSchema>;
export type DraftPartyRoleInput = z.infer<typeof draftPartyRoleInputSchema>;
