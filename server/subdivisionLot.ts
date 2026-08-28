import type { SupabaseClient } from "@supabase/supabase-js";
import { draftSubdivisionLotInputSchema, subdivisionContextSchema, type DraftSubdivisionLotInput } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";
type RpcClient = Pick<SupabaseClient, "rpc">;
export type DraftSubdivisionLotSummary = { lotId: string; blockId: string; lotNumber: number; createdAt: string };
function requireSubject(subjectId: string | undefined): string { if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED"); return subjectId; }
export async function listDraftSubdivisionLots(subjectId: string | undefined, rawContext: unknown, blockId: string, client: RpcClient = getSupabaseAdminClient()): Promise<DraftSubdivisionLotSummary[]> {
  const actorUserId = requireSubject(subjectId); const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_draft_lots", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode, p_block_id: blockId });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_LOT_READ_DENIED");
  return data.map((row) => ({ lotId: String(row.lot_id), blockId: String(row.block_id), lotNumber: Number(row.lot_number), createdAt: String(row.created_at) }));
}
export async function createDraftSubdivisionLot(subjectId: string | undefined, rawInput: DraftSubdivisionLotInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ lotId: string }> {
  const actorUserId = requireSubject(subjectId); const input = draftSubdivisionLotInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_create_draft_lot", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_block_id: input.blockId, p_lot_number: input.lotNumber, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_LOT_COMMAND_DENIED"); return { lotId: data };
}
