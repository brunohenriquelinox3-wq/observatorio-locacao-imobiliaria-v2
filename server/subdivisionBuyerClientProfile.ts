import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  subdivisionBuyerClientContactChannelSchema,
  subdivisionBuyerClientContactPreferenceStateSchema,
  subdivisionBuyerClientContactPurposeSchema,
  subdivisionBuyerClientProfileLookupInputSchema,
  subdivisionBuyerClientProfilePartyKindSchema,
  subdivisionBuyerClientRegistrationStateSchema,
  subdivisionBuyerClientCivilStatusSchema,
  subdivisionBuyerClientRepresentationStateSchema,
  subdivisionBuyerClientRequirementCodeSchema,
  subdivisionBuyerClientRequirementStateSchema,
  upsertSubdivisionBuyerClientContactPreferenceInputSchema,
  upsertSubdivisionBuyerClientProfileInputSchema,
  upsertSubdivisionBuyerClientRequirementInputSchema,
  type SubdivisionBuyerClientProfileLookupInput,
  type UpsertSubdivisionBuyerClientContactPreferenceInput,
  type UpsertSubdivisionBuyerClientProfileInput,
  type UpsertSubdivisionBuyerClientRequirementInput,
} from "../shared/subdivisionBuyerClientProfileContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type RpcRow = Record<string, unknown>;

export type SubdivisionBuyerClientProfileSummary = {
  profileId: string;
  buyerClientId: string;
  partyKind: "individual" | "legal_entity";
  registrationState: "contact_pending" | "base_data_in_progress" | "conditional_requirements_pending" | "base_data_review";
  civilStatus: "not_declared" | "single" | "married" | "stable_union" | "divorced" | "widowed" | "informed_other";
  representationState: "not_declared" | "self_represented" | "represented" | "legal_entity_represented";
  documentReferencePresent: boolean;
  primaryEmailPresent: boolean;
  primaryPhonePresent: boolean;
  messagingPhonePresent: boolean;
  updatedAt: string;
};

export type SubdivisionBuyerClientProfile = Omit<SubdivisionBuyerClientProfileSummary, "documentReferencePresent" | "primaryEmailPresent" | "primaryPhonePresent" | "messagingPhonePresent"> & {
  documentReference: string | null;
  primaryEmail: string | null;
  primaryPhone: string | null;
  messagingPhone: string | null;
};

export type SubdivisionBuyerClientRequirement = {
  requirementCode: "identity_evidence" | "fiscal_identifier" | "address_evidence" | "civil_status_evidence" | "spousal_qualification" | "representation_powers" | "legal_entity_registration" | "legal_entity_governance";
  requirementState: "not_applicable" | "to_confirm" | "pending_evidence" | "under_review" | "declared_complete";
  updatedAt: string;
};

export type SubdivisionBuyerClientContactPreference = {
  contactPurpose: "service_contact" | "marketing_contact";
  contactChannel: "email" | "phone_call" | "messaging";
  preferenceState: "granted" | "revoked";
  decidedAt: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

function asString(row: RpcRow, key: string): string {
  const value = row[key];
  if (typeof value !== "string") throw new Error("SUBDIVISION_BUYER_CLIENT_PROFILE_READ_DENIED");
  return value;
}

function asNullableString(row: RpcRow, key: string): string | null {
  const value = row[key];
  if (value === null) return null;
  if (typeof value !== "string") throw new Error("SUBDIVISION_BUYER_CLIENT_PROFILE_READ_DENIED");
  return value;
}

function parseEnum<T extends z.ZodType>(schema: T, value: unknown): z.output<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new Error("SUBDIVISION_BUYER_CLIENT_PROFILE_READ_DENIED");
  return parsed.data;
}

function profileFromRow(row: RpcRow): SubdivisionBuyerClientProfile {
  const documentReference = asNullableString(row, "document_reference");
  const primaryEmail = asNullableString(row, "primary_email");
  const primaryPhone = asNullableString(row, "primary_phone");
  const messagingPhone = asNullableString(row, "messaging_phone");
  return {
    profileId: asString(row, "profile_id"),
    buyerClientId: asString(row, "buyer_client_id"),
    partyKind: parseEnum(subdivisionBuyerClientProfilePartyKindSchema, row.party_kind),
    registrationState: parseEnum(subdivisionBuyerClientRegistrationStateSchema, row.registration_state),
    civilStatus: parseEnum(subdivisionBuyerClientCivilStatusSchema, row.civil_status),
    representationState: parseEnum(subdivisionBuyerClientRepresentationStateSchema, row.representation_state),
    documentReference,
    primaryEmail,
    primaryPhone,
    messagingPhone,
    updatedAt: asString(row, "updated_at"),
  };
}

export async function listDraftSubdivisionBuyerClientProfileSummaries(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionBuyerClientProfileSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionBuyerClientProfileLookupInputSchema.pick({ organizationId: true, module: true, purposeCode: true }).parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_draft_buyer_client_profile_summaries", {
    p_actor_user_id: actorUserId,
    p_organization_id: context.organizationId,
    p_module: context.module,
    p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_BUYER_CLIENT_PROFILE_READ_DENIED");
  return data.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("SUBDIVISION_BUYER_CLIENT_PROFILE_READ_DENIED");
    const row = raw as RpcRow;
    return {
      profileId: asString(row, "profile_id"),
      buyerClientId: asString(row, "buyer_client_id"),
      partyKind: parseEnum(subdivisionBuyerClientProfilePartyKindSchema, row.party_kind),
      registrationState: parseEnum(subdivisionBuyerClientRegistrationStateSchema, row.registration_state),
      civilStatus: parseEnum(subdivisionBuyerClientCivilStatusSchema, row.civil_status),
      representationState: parseEnum(subdivisionBuyerClientRepresentationStateSchema, row.representation_state),
      documentReferencePresent: row.document_reference_present === true,
      primaryEmailPresent: row.primary_email_present === true,
      primaryPhonePresent: row.primary_phone_present === true,
      messagingPhonePresent: row.messaging_phone_present === true,
      updatedAt: asString(row, "updated_at"),
    };
  });
}

export async function getDraftSubdivisionBuyerClientProfile(subjectId: string | undefined, rawInput: SubdivisionBuyerClientProfileLookupInput, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionBuyerClientProfile | null> {
  const actorUserId = requireSubject(subjectId);
  const input = subdivisionBuyerClientProfileLookupInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_get_draft_buyer_client_profile", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_buyer_client_id: input.buyerClientId,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_BUYER_CLIENT_PROFILE_READ_DENIED");
  if (data.length === 0) return null;
  if (data.length !== 1 || !data[0] || typeof data[0] !== "object" || Array.isArray(data[0])) throw new Error("SUBDIVISION_BUYER_CLIENT_PROFILE_READ_DENIED");
  return profileFromRow(data[0] as RpcRow);
}

export async function upsertDraftSubdivisionBuyerClientProfile(subjectId: string | undefined, rawInput: UpsertSubdivisionBuyerClientProfileInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ profileId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = upsertSubdivisionBuyerClientProfileInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_upsert_draft_buyer_client_profile", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_buyer_client_id: input.buyerClientId,
    p_party_kind: input.partyKind,
    p_registration_state: input.registrationState,
    p_document_reference: input.documentReference,
    p_primary_email: input.primaryEmail,
    p_primary_phone: input.primaryPhone,
    p_messaging_phone: input.messagingPhone,
    p_civil_status: input.civilStatus,
    p_representation_state: input.representationState,
    p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_BUYER_CLIENT_PROFILE_COMMAND_DENIED");
  return { profileId: data };
}

export async function listDraftSubdivisionBuyerClientRequirements(subjectId: string | undefined, rawInput: SubdivisionBuyerClientProfileLookupInput, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionBuyerClientRequirement[]> {
  const actorUserId = requireSubject(subjectId);
  const input = subdivisionBuyerClientProfileLookupInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_list_draft_buyer_client_requirements", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_buyer_client_id: input.buyerClientId,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_BUYER_CLIENT_REQUIREMENT_READ_DENIED");
  return data.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("SUBDIVISION_BUYER_CLIENT_REQUIREMENT_READ_DENIED");
    const row = raw as RpcRow;
    return {
      requirementCode: parseEnum(subdivisionBuyerClientRequirementCodeSchema, row.requirement_code),
      requirementState: parseEnum(subdivisionBuyerClientRequirementStateSchema, row.requirement_state),
      updatedAt: asString(row, "updated_at"),
    };
  });
}

export async function upsertDraftSubdivisionBuyerClientRequirement(subjectId: string | undefined, rawInput: UpsertSubdivisionBuyerClientRequirementInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ requirementCode: string; requirementState: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = upsertSubdivisionBuyerClientRequirementInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_upsert_draft_buyer_client_requirement", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_buyer_client_id: input.buyerClientId,
    p_requirement_code: input.requirementCode,
    p_requirement_state: input.requirementState,
    p_correlation_id: input.correlationId,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) throw new Error("SUBDIVISION_BUYER_CLIENT_REQUIREMENT_COMMAND_DENIED");
  const result = data as RpcRow;
  return {
    requirementCode: parseEnum(subdivisionBuyerClientRequirementCodeSchema, result.requirement_code),
    requirementState: parseEnum(subdivisionBuyerClientRequirementStateSchema, result.requirement_state),
  };
}

export async function listDraftSubdivisionBuyerClientContactPreferences(subjectId: string | undefined, rawInput: SubdivisionBuyerClientProfileLookupInput, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionBuyerClientContactPreference[]> {
  const actorUserId = requireSubject(subjectId);
  const input = subdivisionBuyerClientProfileLookupInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_list_draft_buyer_client_contact_preferences", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_buyer_client_id: input.buyerClientId,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_BUYER_CLIENT_CONTACT_PREFERENCE_READ_DENIED");
  return data.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("SUBDIVISION_BUYER_CLIENT_CONTACT_PREFERENCE_READ_DENIED");
    const row = raw as RpcRow;
    return {
      contactPurpose: parseEnum(subdivisionBuyerClientContactPurposeSchema, row.contact_purpose),
      contactChannel: parseEnum(subdivisionBuyerClientContactChannelSchema, row.contact_channel),
      preferenceState: parseEnum(subdivisionBuyerClientContactPreferenceStateSchema, row.preference_state),
      decidedAt: asString(row, "decided_at"),
    };
  });
}

export async function upsertDraftSubdivisionBuyerClientContactPreference(subjectId: string | undefined, rawInput: UpsertSubdivisionBuyerClientContactPreferenceInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ contactPurpose: string; contactChannel: string; preferenceState: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = upsertSubdivisionBuyerClientContactPreferenceInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_upsert_draft_buyer_client_contact_preference", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_buyer_client_id: input.buyerClientId,
    p_contact_purpose: input.contactPurpose,
    p_contact_channel: input.contactChannel,
    p_preference_state: input.preferenceState,
    p_correlation_id: input.correlationId,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) throw new Error("SUBDIVISION_BUYER_CLIENT_CONTACT_PREFERENCE_COMMAND_DENIED");
  const result = data as RpcRow;
  return {
    contactPurpose: parseEnum(subdivisionBuyerClientContactPurposeSchema, result.contact_purpose),
    contactChannel: parseEnum(subdivisionBuyerClientContactChannelSchema, result.contact_channel),
    preferenceState: parseEnum(subdivisionBuyerClientContactPreferenceStateSchema, result.preference_state),
  };
}
