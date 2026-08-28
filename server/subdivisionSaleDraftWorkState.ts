import type { SupabaseClient } from "@supabase/supabase-js";
import { draftSubdivisionSaleDraftWorkStateInputSchema, subdivisionContextSchema, type DraftSubdivisionSaleDraftWorkStateInput } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
const workPhases = ["link_review", "attachment_review", "human_review"] as const;
type WorkPhase = (typeof workPhases)[number];
export type SubdivisionSaleDraftWorkStateSummary = { saleDraftWorkStateId: string; saleDraftId: string; workPhase: WorkPhase; updatedAt: string };

function requireSubject(subjectId: string | undefined) {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

export async function upsertSubdivisionSaleDraftWorkState(subjectId: string | undefined, rawInput: DraftSubdivisionSaleDraftWorkStateInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ saleDraftWorkStateId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftSubdivisionSaleDraftWorkStateInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_upsert_sale_draft_work_state", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_sale_draft_id: input.saleDraftId, p_work_phase: input.workPhase, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_SALE_DRAFT_WORK_STATE_DENIED");
  return { saleDraftWorkStateId: data };
}

export async function listSubdivisionSaleDraftWorkStates(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionSaleDraftWorkStateSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_sale_draft_work_states", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_SALE_DRAFT_WORK_STATE_READ_DENIED");
  return data.map((row) => {
    const workPhase = String(row.work_phase);
    if (!workPhases.includes(workPhase as WorkPhase)) throw new Error("SUBDIVISION_SALE_DRAFT_WORK_STATE_READ_DENIED");
    return { saleDraftWorkStateId: String(row.sale_draft_work_state_id), saleDraftId: String(row.sale_draft_id), workPhase: workPhase as WorkPhase, updatedAt: String(row.updated_at) };
  });
}
