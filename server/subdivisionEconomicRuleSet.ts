import type { SupabaseClient } from "@supabase/supabase-js";
import { draftSubdivisionEconomicRuleSetInputSchema, subdivisionContextSchema, type DraftSubdivisionEconomicRuleSetInput } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
const workingStates = ["draft_internal", "review_required"] as const;
type WorkingState = (typeof workingStates)[number];
export type SubdivisionEconomicRuleSetSummary = { economicRuleSetId: string; developmentId: string; versionReference: string; workingState: WorkingState; createdAt: string };

function requireSubject(subjectId: string | undefined) {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

export async function createSubdivisionEconomicRuleSet(subjectId: string | undefined, rawInput: DraftSubdivisionEconomicRuleSetInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ economicRuleSetId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftSubdivisionEconomicRuleSetInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_create_economic_rule_set", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_development_id: input.developmentId, p_version_reference: input.versionReference, p_working_state: input.workingState, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_ECONOMIC_RULE_SET_DENIED");
  return { economicRuleSetId: data };
}

export async function listSubdivisionEconomicRuleSets(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionEconomicRuleSetSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_economic_rule_sets", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_ECONOMIC_RULE_SET_READ_DENIED");
  return data.map((row) => {
    const workingState = String(row.working_state);
    if (!workingStates.includes(workingState as WorkingState)) throw new Error("SUBDIVISION_ECONOMIC_RULE_SET_READ_DENIED");
    return { economicRuleSetId: String(row.economic_rule_set_id), developmentId: String(row.development_id), versionReference: String(row.version_reference), workingState: workingState as WorkingState, createdAt: String(row.created_at) };
  });
}
