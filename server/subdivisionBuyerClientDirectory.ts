import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  subdivisionBuyerClientDirectoryListInputSchema,
  subdivisionBuyerClientProfilePartyKindSchema,
  subdivisionBuyerClientReadinessListInputSchema,
  subdivisionBuyerClientRegistrationStateSchema,
  subdivisionBuyerClientTimelineInputSchema,
  type SubdivisionBuyerClientDirectoryListInput,
  type SubdivisionBuyerClientReadinessListInput,
  type SubdivisionBuyerClientTimelineInput,
} from "../shared/subdivisionBuyerClientProfileContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type RpcRow = Record<string, unknown>;

const attachmentSummarySchema = z.enum(["no_private_attachment", "awaiting_private_upload", "private_upload_recorded"]);
const timelineEventKindSchema = z.enum(["buyer_client_registered", "profile_cadastral_atualizado", "pendencia_atualizada", "preferencia_atualizada", "anexo_privado_registrado"]);

export type SubdivisionBuyerClientDirectoryEntry = {
  buyerClientId: string;
  displayName: string;
  partyKind: "individual" | "legal_entity";
  registrationState: "contact_pending" | "base_data_in_progress" | "conditional_requirements_pending" | "base_data_review";
  profilePresent: boolean;
  contactChannelsRecorded: number;
  requirementsPending: number;
  requirementsTotal: number;
  attachmentSummary: "no_private_attachment" | "awaiting_private_upload" | "private_upload_recorded";
  updatedAt: string;
};

export type SubdivisionBuyerClientDirectoryTotal = {
  total: number;
};

export type SubdivisionBuyerClientReadinessEntry = {
  buyerClientId: string;
  displayName: string;
  registrationState: "contact_pending" | "base_data_in_progress" | "conditional_requirements_pending" | "base_data_review";
  primaryPhone: string | null;
  messagingPhone: string | null;
  updatedAt: string;
};

export type SubdivisionBuyerClientTimelineEntry = {
  eventKind: "buyer_client_registered" | "profile_cadastral_atualizado" | "pendencia_atualizada" | "preferencia_atualizada" | "anexo_privado_registrado";
  occurredAt: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

function asString(row: RpcRow, key: string, errorCode: string): string {
  const value = row[key];
  if (typeof value !== "string") throw new Error(errorCode);
  return value;
}

function asBoolean(row: RpcRow, key: string, errorCode: string): boolean {
  const value = row[key];
  if (typeof value !== "boolean") throw new Error(errorCode);
  return value;
}

function asNullableString(row: RpcRow, key: string, errorCode: string): string | null {
  const value = row[key];
  if (value === null) return null;
  if (typeof value !== "string") throw new Error(errorCode);
  return value;
}

function asCount(row: RpcRow, key: string, errorCode: string): number {
  const value = row[key];
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 99) throw new Error(errorCode);
  return value;
}

function asDirectoryTotal(value: unknown, errorCode: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 1_000_000) throw new Error(errorCode);
  return value;
}

function parseEnum<T extends z.ZodType>(schema: T, value: unknown, errorCode: string): z.output<T> {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new Error(errorCode);
  return parsed.data;
}

function directoryEntryFromRow(row: RpcRow): SubdivisionBuyerClientDirectoryEntry {
  const errorCode = "SUBDIVISION_BUYER_CLIENT_DIRECTORY_READ_DENIED";
  return {
    buyerClientId: asString(row, "buyer_client_id", errorCode),
    displayName: asString(row, "display_name", errorCode),
    partyKind: parseEnum(subdivisionBuyerClientProfilePartyKindSchema, row.party_kind, errorCode),
    registrationState: parseEnum(subdivisionBuyerClientRegistrationStateSchema, row.registration_state, errorCode),
    profilePresent: asBoolean(row, "profile_present", errorCode),
    contactChannelsRecorded: asCount(row, "contact_channels_recorded", errorCode),
    requirementsPending: asCount(row, "requirements_pending", errorCode),
    requirementsTotal: asCount(row, "requirements_total", errorCode),
    attachmentSummary: parseEnum(attachmentSummarySchema, row.attachment_summary, errorCode),
    updatedAt: asString(row, "updated_at", errorCode),
  };
}

function readinessEntryFromRow(row: RpcRow): SubdivisionBuyerClientReadinessEntry {
  const errorCode = "SUBDIVISION_BUYER_CLIENT_READINESS_READ_DENIED";
  return {
    buyerClientId: asString(row, "buyer_client_id", errorCode),
    displayName: asString(row, "display_name", errorCode),
    registrationState: parseEnum(subdivisionBuyerClientRegistrationStateSchema, row.registration_state, errorCode),
    primaryPhone: asNullableString(row, "primary_phone", errorCode),
    messagingPhone: asNullableString(row, "messaging_phone", errorCode),
    updatedAt: asString(row, "updated_at", errorCode),
  };
}

export async function listDraftSubdivisionBuyerClientDirectory(subjectId: string | undefined, rawInput: SubdivisionBuyerClientDirectoryListInput, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionBuyerClientDirectoryEntry[]> {
  const actorUserId = requireSubject(subjectId);
  const input = subdivisionBuyerClientDirectoryListInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_list_draft_buyer_client_directory", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_search_term: input.searchTerm,
    p_page_size: input.pageSize,
    p_page_offset: input.pageOffset,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_BUYER_CLIENT_DIRECTORY_READ_DENIED");
  return data.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("SUBDIVISION_BUYER_CLIENT_DIRECTORY_READ_DENIED");
    return directoryEntryFromRow(raw as RpcRow);
  });
}

export async function getDraftSubdivisionBuyerClientDirectoryTotal(subjectId: string | undefined, rawInput: SubdivisionBuyerClientDirectoryListInput, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionBuyerClientDirectoryTotal> {
  const actorUserId = requireSubject(subjectId);
  const input = subdivisionBuyerClientDirectoryListInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_count_draft_buyer_client_directory", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_search_term: input.searchTerm,
  });
  if (error) throw new Error("SUBDIVISION_BUYER_CLIENT_DIRECTORY_TOTAL_READ_DENIED");
  return { total: asDirectoryTotal(data, "SUBDIVISION_BUYER_CLIENT_DIRECTORY_TOTAL_READ_DENIED") };
}

export async function listDraftSubdivisionBuyerClientReadiness(subjectId: string | undefined, rawInput: SubdivisionBuyerClientReadinessListInput, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionBuyerClientReadinessEntry[]> {
  const actorUserId = requireSubject(subjectId);
  const input = subdivisionBuyerClientReadinessListInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_list_draft_buyer_client_readiness", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_page_size: input.pageSize,
    p_page_offset: input.pageOffset,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_BUYER_CLIENT_READINESS_READ_DENIED");
  return data.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("SUBDIVISION_BUYER_CLIENT_READINESS_READ_DENIED");
    return readinessEntryFromRow(raw as RpcRow);
  });
}

export async function listDraftSubdivisionBuyerClientTimeline(subjectId: string | undefined, rawInput: SubdivisionBuyerClientTimelineInput, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionBuyerClientTimelineEntry[]> {
  const actorUserId = requireSubject(subjectId);
  const input = subdivisionBuyerClientTimelineInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_list_draft_buyer_client_timeline", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_buyer_client_id: input.buyerClientId,
    p_limit: input.limit,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_BUYER_CLIENT_TIMELINE_READ_DENIED");
  return data.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("SUBDIVISION_BUYER_CLIENT_TIMELINE_READ_DENIED");
    const row = raw as RpcRow;
    return {
      eventKind: parseEnum(timelineEventKindSchema, row.event_kind, "SUBDIVISION_BUYER_CLIENT_TIMELINE_READ_DENIED"),
      occurredAt: asString(row, "occurred_at", "SUBDIVISION_BUYER_CLIENT_TIMELINE_READ_DENIED"),
    };
  });
}
