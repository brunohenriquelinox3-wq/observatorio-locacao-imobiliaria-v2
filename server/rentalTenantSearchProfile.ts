import type { SupabaseClient } from "@supabase/supabase-js";
import {
  draftRentalTenantSearchProfileInputSchema,
  rentalOperatingContextSchema,
  type DraftRentalTenantSearchProfileInput,
} from "../shared/rentalPipelineContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type UrbanAssetKind = "apartment" | "house" | "kitnet" | "commercial_unit" | "urban_lot" | "building" | "other_urban_asset";

export type DraftRentalTenantSearchProfileSummary = {
  profileId: string;
  intakeId: string;
  acceptedAssetKinds: UrbanAssetKind[];
  occupancyTiming: "immediate" | "up_to_30_days" | "flexible";
  preferenceCode: string;
  createdAt: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("RENTAL_IDENTITY_REQUIRED");
  return subjectId;
}

async function invokeUuidRpc(client: RpcClient, functionName: string, parameters: Record<string, unknown>): Promise<string> {
  const { data, error } = await client.rpc(functionName, parameters);
  if (error || typeof data !== "string") throw new Error("RENTAL_TENANT_SEARCH_COMMAND_DENIED");
  return data;
}

const assetKinds: UrbanAssetKind[] = ["apartment", "house", "kitnet", "commercial_unit", "urban_lot", "building", "other_urban_asset"];
const occupancyTimings = ["immediate", "up_to_30_days", "flexible"] as const;

export async function listDraftRentalTenantSearchProfiles(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<DraftRentalTenantSearchProfileSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = rentalOperatingContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("rental_list_draft_tenant_search_profiles", {
    p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("RENTAL_TENANT_SEARCH_READ_DENIED");
  return data.map((row) => ({
    profileId: String(row.profile_id),
    intakeId: String(row.intake_id),
    acceptedAssetKinds: Array.isArray(row.accepted_asset_kinds)
      ? row.accepted_asset_kinds.filter((kind: unknown): kind is UrbanAssetKind => assetKinds.includes(String(kind) as UrbanAssetKind)) : [],
    occupancyTiming: occupancyTimings.includes(String(row.occupancy_timing) as typeof occupancyTimings[number])
      ? String(row.occupancy_timing) as DraftRentalTenantSearchProfileSummary["occupancyTiming"] : "flexible",
    preferenceCode: String(row.preference_code),
    createdAt: String(row.created_at),
  }));
}

export async function upsertDraftRentalTenantSearchProfile(subjectId: string | undefined, rawInput: DraftRentalTenantSearchProfileInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ profileId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftRentalTenantSearchProfileInputSchema.parse(rawInput);
  return { profileId: await invokeUuidRpc(client, "rental_upsert_draft_tenant_search_profile", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_intake_id: input.intakeId, p_accepted_asset_kinds: input.acceptedAssetKinds, p_occupancy_timing: input.occupancyTiming,
    p_preference_code: input.preferenceCode, p_correlation_id: input.correlationId,
  }) };
}
