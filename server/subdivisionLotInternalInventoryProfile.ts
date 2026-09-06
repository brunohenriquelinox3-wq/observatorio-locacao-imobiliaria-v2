import type { SupabaseClient } from "@supabase/supabase-js";
import {
  listSubdivisionLotInternalInventoryProfilesInputSchema,
  upsertSubdivisionLotInternalInventoryProfileInputSchema,
  type UpsertSubdivisionLotInternalInventoryProfileInput,
} from "../shared/subdivisionInternalInventoryContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type InternalInventoryClassification = "standard" | "attention" | "technical";
type InternalInventoryReviewState = "not_reviewed" | "reviewed" | "needs_review";
type InternalInventoryMapLegend = "base" | "attention" | "technical";

export type InternalLotInventoryProfile = {
  blockId: string;
  blockNumber: number;
  lotNumber: number;
  profileRecorded: boolean;
  inventoryClassification: InternalInventoryClassification;
  reviewState: InternalInventoryReviewState;
  mapLegend: InternalInventoryMapLegend;
  internalNote: string | null;
  updatedAt: string | null;
};

const classifications = ["standard", "attention", "technical"] as const;
const reviewStates = ["not_reviewed", "reviewed", "needs_review"] as const;
const mapLegends = ["base", "attention", "technical"] as const;

function requireSubject(subjectId: string | undefined) {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

export async function listSubdivisionLotInternalInventoryProfiles(
  subjectId: string | undefined,
  rawInput: unknown,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<InternalLotInventoryProfile[]> {
  const actorUserId = requireSubject(subjectId);
  const input = listSubdivisionLotInternalInventoryProfilesInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_list_draft_lot_internal_inventory_profiles_v1", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_INTERNAL_INVENTORY_PROFILE_READ_DENIED");
  return data.map((value) => {
    const row = value as Record<string, unknown>;
    const inventoryClassification = String(row.inventory_classification);
    const reviewState = String(row.review_state);
    const mapLegend = String(row.map_legend);
    const blockNumber = Number(row.block_number);
    const lotNumber = Number(row.lot_number);
    if (
      typeof row.block_id !== "string" || !Number.isInteger(blockNumber) || !Number.isInteger(lotNumber)
      || !classifications.includes(inventoryClassification as InternalInventoryClassification)
      || !reviewStates.includes(reviewState as InternalInventoryReviewState)
      || !mapLegends.includes(mapLegend as InternalInventoryMapLegend)
    ) throw new Error("SUBDIVISION_INTERNAL_INVENTORY_PROFILE_READ_DENIED");
    const internalNote = row.internal_note === null || row.internal_note === undefined ? null : String(row.internal_note);
    if (internalNote !== null && internalNote.length > 280) throw new Error("SUBDIVISION_INTERNAL_INVENTORY_PROFILE_READ_DENIED");
    return {
      blockId: row.block_id,
      blockNumber,
      lotNumber,
      profileRecorded: row.profile_recorded === true,
      inventoryClassification: inventoryClassification as InternalInventoryClassification,
      reviewState: reviewState as InternalInventoryReviewState,
      mapLegend: mapLegend as InternalInventoryMapLegend,
      internalNote,
      updatedAt: typeof row.updated_at === "string" ? row.updated_at : null,
    };
  });
}

export async function upsertSubdivisionLotInternalInventoryProfile(
  subjectId: string | undefined,
  rawInput: UpsertSubdivisionLotInternalInventoryProfileInput,
  client: RpcClient = getSupabaseAdminClient(),
) {
  const actorUserId = requireSubject(subjectId);
  const input = upsertSubdivisionLotInternalInventoryProfileInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_upsert_draft_lot_internal_inventory_profile_v1", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_block_id: input.blockId,
    p_lot_number: input.lotNumber,
    p_inventory_classification: input.inventoryClassification,
    p_review_state: input.reviewState,
    p_map_legend: input.mapLegend,
    p_internal_note: input.internalNote,
    p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_INTERNAL_INVENTORY_PROFILE_COMMAND_DENIED");
  return { lotId: data };
}
