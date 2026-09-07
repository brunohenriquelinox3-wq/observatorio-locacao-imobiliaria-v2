import type { SupabaseClient } from "@supabase/supabase-js";
import { subdivisionContextSchema } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
const requireSubject = (subjectId: string | undefined) => { if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED"); return subjectId; };
export type InternalReceivableAttention = { contractPreparationId: string; dueWithinFourDaysCount: number; pastDueUnreconciledCount: number };

export async function listSubdivisionInternalReceivableAttention(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<InternalReceivableAttention[]> {
  const actorUserId = requireSubject(subjectId); const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_internal_receivable_attention", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_RECEIVABLE_ATTENTION_READ_DENIED");
  return data.map((row) => { const contractPreparationId = String(row.contract_preparation_id); const dueWithinFourDaysCount = Number(row.due_within_four_days_count); const pastDueUnreconciledCount = Number(row.past_due_unreconciled_count); if (!contractPreparationId || !Number.isInteger(dueWithinFourDaysCount) || dueWithinFourDaysCount < 0 || !Number.isInteger(pastDueUnreconciledCount) || pastDueUnreconciledCount < 0) throw new Error("SUBDIVISION_RECEIVABLE_ATTENTION_READ_DENIED"); return { contractPreparationId, dueWithinFourDaysCount, pastDueUnreconciledCount }; });
}
