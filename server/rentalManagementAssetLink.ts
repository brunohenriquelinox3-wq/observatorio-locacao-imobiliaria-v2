import type { SupabaseClient } from "@supabase/supabase-js";
import {
  rentalManagementAssetLinkInputSchema,
  rentalOperatingContextSchema,
  type RentalManagementAssetLinkInput,
} from "../shared/rentalPipelineContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

export type DraftRentalManagementAssetLinkSummary = {
  linkId: string;
  intakeId: string;
  assetId: string;
  assetKind: "apartment" | "house" | "kitnet" | "commercial_unit" | "urban_lot" | "building" | "other_urban_asset";
  assetReferenceLabel: string;
  assetInternalReference: string;
  linkedAt: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("RENTAL_IDENTITY_REQUIRED");
  return subjectId;
}

async function invokeUuidRpc(client: RpcClient, functionName: string, parameters: Record<string, unknown>): Promise<string> {
  const { data, error } = await client.rpc(functionName, parameters);
  if (error || typeof data !== "string") throw new Error("RENTAL_MANAGEMENT_ASSET_COMMAND_DENIED");
  return data;
}

export async function listDraftRentalManagementAssetLinks(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<DraftRentalManagementAssetLinkSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = rentalOperatingContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("rental_list_draft_management_asset_links", {
    p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("RENTAL_MANAGEMENT_ASSET_READ_DENIED");
  return data.map((row) => ({
    linkId: String(row.link_id),
    intakeId: String(row.intake_id),
    assetId: String(row.asset_id),
    assetKind: ["apartment", "house", "kitnet", "commercial_unit", "urban_lot", "building"].includes(String(row.asset_kind))
      ? String(row.asset_kind) as DraftRentalManagementAssetLinkSummary["assetKind"] : "other_urban_asset",
    assetReferenceLabel: String(row.asset_reference_label),
    assetInternalReference: String(row.asset_internal_reference),
    linkedAt: String(row.linked_at),
  }));
}

export async function linkDraftRentalManagementAsset(subjectId: string | undefined, rawInput: RentalManagementAssetLinkInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ linkId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = rentalManagementAssetLinkInputSchema.parse(rawInput);
  return { linkId: await invokeUuidRpc(client, "rental_link_draft_management_asset", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_intake_id: input.intakeId, p_asset_id: input.assetId, p_correlation_id: input.correlationId,
  }) };
}
