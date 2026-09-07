import { z } from "zod";
import { subdivisionContextSchema } from "./subdivisionContracts";

export const subdivisionBuyerClientProfilePartyKindSchema = z.enum(["individual", "legal_entity"]);
export const subdivisionBuyerClientRegistrationStateSchema = z.enum([
  "contact_pending",
  "base_data_in_progress",
  "conditional_requirements_pending",
  "base_data_review",
]);
export const subdivisionBuyerClientCivilStatusSchema = z.enum([
  "not_declared",
  "single",
  "married",
  "stable_union",
  "divorced",
  "widowed",
  "informed_other",
]);
export const subdivisionBuyerClientRepresentationStateSchema = z.enum([
  "not_declared",
  "self_represented",
  "represented",
  "legal_entity_represented",
]);
export const subdivisionBuyerClientRequirementCodeSchema = z.enum([
  "identity_evidence",
  "fiscal_identifier",
  "address_evidence",
  "civil_status_evidence",
  "spousal_qualification",
  "representation_powers",
  "legal_entity_registration",
  "legal_entity_governance",
]);
export const subdivisionBuyerClientRequirementStateSchema = z.enum([
  "not_applicable",
  "to_confirm",
  "pending_evidence",
  "under_review",
  "declared_complete",
]);
export const subdivisionBuyerClientContactPurposeSchema = z.enum(["service_contact", "marketing_contact"]);
export const subdivisionBuyerClientContactChannelSchema = z.enum(["email", "phone_call", "messaging"]);
export const subdivisionBuyerClientContactPreferenceStateSchema = z.enum(["granted", "revoked"]);

const optionalDocumentReference = z.string().trim().regex(/^(?:[0-9]{11}|[0-9]{14})$/).nullable();
const optionalIdentityDocumentReference = z.string().trim().min(4).max(40).regex(/^[A-Za-z0-9.\-/\s]+$/).nullable();
const optionalEmail = z.string().trim().email().max(320).nullable();
const optionalPhone = z.string().trim().regex(/^[0-9+().\-\s]{8,25}$/).nullable();

export const subdivisionBuyerClientProfileLookupInputSchema = subdivisionContextSchema.extend({
  buyerClientId: z.string().uuid(),
}).strict();

export const subdivisionBuyerClientDirectoryListInputSchema = subdivisionContextSchema.extend({
	searchTerm: z.string().trim().min(2).max(80).nullable(),
	pageSize: z.number().int().min(1).max(25),
	pageOffset: z.number().int().min(0).max(49_975),
}).strict();

export const subdivisionBuyerClientTimelineInputSchema = subdivisionContextSchema.extend({
  buyerClientId: z.string().uuid(),
  limit: z.number().int().min(1).max(50),
}).strict();

export const upsertSubdivisionBuyerClientProfileInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  buyerClientId: z.string().uuid(),
  partyKind: subdivisionBuyerClientProfilePartyKindSchema,
  registrationState: subdivisionBuyerClientRegistrationStateSchema,
  documentReference: optionalDocumentReference,
  identityDocumentReference: optionalIdentityDocumentReference,
  primaryEmail: optionalEmail,
  primaryPhone: optionalPhone,
  messagingPhone: optionalPhone,
  civilStatus: subdivisionBuyerClientCivilStatusSchema,
  representationState: subdivisionBuyerClientRepresentationStateSchema,
}).strict();

export const upsertSubdivisionBuyerClientRequirementInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  buyerClientId: z.string().uuid(),
  requirementCode: subdivisionBuyerClientRequirementCodeSchema,
  requirementState: subdivisionBuyerClientRequirementStateSchema,
}).strict();

export const upsertSubdivisionBuyerClientContactPreferenceInputSchema = subdivisionContextSchema.extend({
  correlationId: z.string().uuid(),
  buyerClientId: z.string().uuid(),
  contactPurpose: subdivisionBuyerClientContactPurposeSchema,
  contactChannel: subdivisionBuyerClientContactChannelSchema,
  preferenceState: subdivisionBuyerClientContactPreferenceStateSchema,
}).strict();

export type SubdivisionBuyerClientProfileLookupInput = z.infer<typeof subdivisionBuyerClientProfileLookupInputSchema>;
export type SubdivisionBuyerClientDirectoryListInput = z.infer<typeof subdivisionBuyerClientDirectoryListInputSchema>;
export type SubdivisionBuyerClientTimelineInput = z.infer<typeof subdivisionBuyerClientTimelineInputSchema>;
export type UpsertSubdivisionBuyerClientProfileInput = z.infer<typeof upsertSubdivisionBuyerClientProfileInputSchema>;
export type UpsertSubdivisionBuyerClientRequirementInput = z.infer<typeof upsertSubdivisionBuyerClientRequirementInputSchema>;
export type UpsertSubdivisionBuyerClientContactPreferenceInput = z.infer<typeof upsertSubdivisionBuyerClientContactPreferenceInputSchema>;
