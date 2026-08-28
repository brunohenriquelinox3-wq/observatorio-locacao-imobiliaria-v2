import { z } from "zod";
import { domainContextSchema } from "./domainFoundationContracts";

export const rentalOperatingContextSchema = domainContextSchema.extend({ module: z.literal("locacao") });

export const rentalJourneyKindSchema = z.enum(["management_interest", "tenant_interest"]);
export const rentalIntakeStageSchema = z.enum(["intake", "qualification", "agenda_pending", "scheduled", "closed_lost"]);
export const rentalAgendaStateSchema = z.enum(["scheduled", "rescheduled", "cancelled", "occurred", "not_held"]);

export const draftRentalIntakeInputSchema = rentalOperatingContextSchema.extend({
  correlationId: z.string().uuid(),
  partyId: z.string().uuid(),
  journeyKind: rentalJourneyKindSchema,
  sourceCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/),
});

export const rentalIntakeStageInputSchema = rentalOperatingContextSchema.extend({
  correlationId: z.string().uuid(),
  intakeId: z.string().uuid(),
  nextStage: rentalIntakeStageSchema,
  reasonCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/).optional(),
}).superRefine((value, context) => {
  if (value.nextStage === "closed_lost" && !value.reasonCode) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["reasonCode"], message: "Encerramento sem ganho exige motivo em código." });
  }
});

export const draftRentalAgendaInputSchema = rentalOperatingContextSchema.extend({
  correlationId: z.string().uuid(),
  intakeId: z.string().uuid(),
  scheduledFor: z.string().datetime(),
  state: rentalAgendaStateSchema.default("scheduled"),
  reasonCode: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{2,79}$/).optional(),
}).superRefine((value, context) => {
  if (["cancelled", "not_held"].includes(value.state) && !value.reasonCode) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["reasonCode"], message: "Cancelamento ou não realização exige motivo em código." });
  }
});

export type DraftRentalIntakeInput = z.infer<typeof draftRentalIntakeInputSchema>;
export type RentalIntakeStageInput = z.infer<typeof rentalIntakeStageInputSchema>;
export type DraftRentalAgendaInput = z.infer<typeof draftRentalAgendaInputSchema>;
