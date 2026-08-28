import type { SupabaseClient } from "@supabase/supabase-js";
import { domainContextSchema, type DomainContext } from "../shared/domainFoundationContracts";
import {
  draftAssetModuleStateInputSchema,
  draftAssetPartyRelationInputSchema,
  draftUrbanAssetInputSchema,
  type DraftAssetModuleStateInput,
  type DraftAssetPartyRelationInput,
  type DraftUrbanAssetInput,
} from "../shared/assetFoundationContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

export type DraftUrbanAssetSummary = {
  assetId: string;
  kind: string;
  referenceLabel: string;
  internalReference: string;
  moduleState: "draft" | "preparing" | "eligible" | "blocked" | "withdrawn";
  stateReasonPresent: boolean;
  partyRelationCount: number;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("ASSET_IDENTITY_REQUIRED");
  return subjectId;
}

async function invokeUuidRpc(client: RpcClient, functionName: string, parameters: Record<string, unknown>): Promise<string> {
  const { data, error } = await client.rpc(functionName, parameters);
  if (error || typeof data !== "string") throw new Error("ASSET_COMMAND_DENIED");
  return data;
}

export async function listDraftUrbanAssets(subjectId: string | undefined, rawContext: DomainContext, client: RpcClient = getSupabaseAdminClient()): Promise<DraftUrbanAssetSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = domainContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("domain_list_draft_urban_assets", {
    p_actor_user_id: actorUserId,
    p_organization_id: context.organizationId,
    p_module: context.module,
    p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("ASSET_READ_DENIED");
  return data.map((row) => ({
    assetId: String(row.asset_id),
    kind: String(row.kind),
    referenceLabel: String(row.reference_label),
    internalReference: String(row.internal_reference),
    moduleState: ["preparing", "eligible", "blocked", "withdrawn"].includes(String(row.module_state))
      ? String(row.module_state) as DraftUrbanAssetSummary["moduleState"] : "draft",
    stateReasonPresent: Boolean(row.state_reason_present),
    partyRelationCount: Number(row.party_relation_count ?? 0),
  }));
}

export async function createDraftUrbanAsset(subjectId: string | undefined, rawInput: DraftUrbanAssetInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ assetId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftUrbanAssetInputSchema.parse(rawInput);
  return { assetId: await invokeUuidRpc(client, "domain_create_draft_urban_asset", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_kind: input.kind, p_reference_label: input.referenceLabel, p_internal_reference: input.internalReference, p_correlation_id: input.correlationId,
  }) };
}

export async function attachDraftAssetParty(subjectId: string | undefined, rawInput: DraftAssetPartyRelationInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ relationId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftAssetPartyRelationInputSchema.parse(rawInput);
  return { relationId: await invokeUuidRpc(client, "domain_attach_draft_asset_party", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_asset_id: input.assetId, p_party_id: input.partyId, p_relation: input.relation, p_starts_at: input.beginsAt ?? null, p_ends_at: input.endsAt ?? null, p_correlation_id: input.correlationId,
  }) };
}

export async function setDraftAssetModuleState(subjectId: string | undefined, rawInput: DraftAssetModuleStateInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ stateId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftAssetModuleStateInputSchema.parse(rawInput);
  return { stateId: await invokeUuidRpc(client, "domain_set_draft_asset_module_state", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_asset_id: input.assetId, p_state: input.state, p_reason_code: input.reasonCode ?? null, p_correlation_id: input.correlationId,
  }) };
}
