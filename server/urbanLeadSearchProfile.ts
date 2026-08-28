import type { SupabaseClient } from "@supabase/supabase-js";
import {
  draftUrbanLeadSearchProfileInputSchema,
  urbanSalesContextSchema,
  type DraftUrbanLeadSearchProfileInput,
} from "../shared/urbanPipelineContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type UrbanAssetKind = "apartment" | "house" | "kitnet" | "commercial_unit" | "urban_lot" | "building" | "other_urban_asset";
type SearchTiming = "immediate" | "up_to_90_days" | "flexible";

export type DraftUrbanLeadSearchProfileSummary = {
  profileId: string;
  leadId: string;
  acceptedAssetKinds: UrbanAssetKind[];
  searchTiming: SearchTiming;
  preferencePresent: boolean;
  updatedAt: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("URBAN_IDENTITY_REQUIRED");
  return subjectId;
}

async function invokeUuidRpc(client: RpcClient, functionName: string, parameters: Record<string, unknown>): Promise<string> {
  const { data, error } = await client.rpc(functionName, parameters);
  if (error || typeof data !== "string") throw new Error("URBAN_SEARCH_PROFILE_COMMAND_DENIED");
  return data;
}

const assetKinds: UrbanAssetKind[] = ["apartment", "house", "kitnet", "commercial_unit", "urban_lot", "building", "other_urban_asset"];
const timings: SearchTiming[] = ["immediate", "up_to_90_days", "flexible"];

export async function listDraftUrbanLeadSearchProfiles(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<DraftUrbanLeadSearchProfileSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = urbanSalesContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("urban_list_draft_lead_search_profiles", {
    p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("URBAN_SEARCH_PROFILE_READ_DENIED");
  return data.map((row) => ({
    profileId: String(row.profile_id),
    leadId: String(row.lead_id),
    acceptedAssetKinds: Array.isArray(row.accepted_asset_kinds)
      ? row.accepted_asset_kinds.filter((kind: unknown): kind is UrbanAssetKind => assetKinds.includes(String(kind) as UrbanAssetKind)) : [],
    searchTiming: timings.includes(String(row.search_timing) as SearchTiming) ? String(row.search_timing) as SearchTiming : "flexible",
    preferencePresent: row.preference_present === true,
    updatedAt: String(row.updated_at),
  }));
}

export async function upsertDraftUrbanLeadSearchProfile(subjectId: string | undefined, rawInput: DraftUrbanLeadSearchProfileInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ profileId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftUrbanLeadSearchProfileInputSchema.parse(rawInput);
  return { profileId: await invokeUuidRpc(client, "urban_upsert_draft_lead_search_profile", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_lead_id: input.leadId, p_accepted_asset_kinds: input.acceptedAssetKinds, p_search_timing: input.searchTiming,
    p_preference_code: input.preferenceCode, p_correlation_id: input.correlationId,
  }) };
}
