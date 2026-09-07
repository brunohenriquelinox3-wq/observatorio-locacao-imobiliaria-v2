import type { SupabaseClient } from "@supabase/supabase-js";
import { subdivisionContextSchema } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";
type RpcClient = Pick<SupabaseClient, "rpc">;
export type SubdivisionInternalReceivableBatch = { batchId: string; saleCaseId: string; contractPreparationId: string; batchState: "released_internal_control" | "reversal_review"; itemCount: number; totalCents: number; releasedAt: string; updatedAt: string };
const requireSubject = (subjectId: string | undefined) => { if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED"); return subjectId; };
export async function listSubdivisionInternalReceivableBatches(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionInternalReceivableBatch[]> {
  const actorUserId = requireSubject(subjectId); const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_internal_receivable_batches", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_INTERNAL_BATCH_LIST_DENIED");
  return data.map((row) => { const value = row as Record<string, unknown>; if (typeof value.batch_id !== "string" || typeof value.sale_case_id !== "string" || typeof value.contract_preparation_id !== "string" || (value.batch_state !== "released_internal_control" && value.batch_state !== "reversal_review") || typeof value.item_count !== "number" || typeof value.total_cents !== "number" || typeof value.released_at !== "string" || typeof value.updated_at !== "string") throw new Error("SUBDIVISION_INTERNAL_BATCH_LIST_DENIED"); return { batchId: value.batch_id, saleCaseId: value.sale_case_id, contractPreparationId: value.contract_preparation_id, batchState: value.batch_state, itemCount: value.item_count, totalCents: value.total_cents, releasedAt: value.released_at, updatedAt: value.updated_at }; });
}
