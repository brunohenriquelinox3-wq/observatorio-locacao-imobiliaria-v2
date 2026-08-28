import type { SupabaseClient } from "@supabase/supabase-js";
import { draftSubdivisionEconomicRuleComponentInputSchema, subdivisionContextSchema, type DraftSubdivisionEconomicRuleComponentInput } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
const componentCodes = ["entry_reference", "installment_reference", "intermediate_reference", "final_result_reference"] as const;
const workingStates = ["draft_internal", "review_required"] as const;
type ComponentCode = (typeof componentCodes)[number];
type WorkingState = (typeof workingStates)[number];
export type SubdivisionEconomicRuleComponentSummary = { economicRuleComponentId: string; economicRuleSetId: string; componentCode: ComponentCode; workingState: WorkingState; createdAt: string };

function requireSubject(subjectId: string | undefined) { if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED"); return subjectId; }

export async function createSubdivisionEconomicRuleComponent(subjectId: string | undefined, rawInput: DraftSubdivisionEconomicRuleComponentInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ economicRuleComponentId: string }> {
  const actorUserId = requireSubject(subjectId); const input = draftSubdivisionEconomicRuleComponentInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_create_economic_rule_component", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_economic_rule_set_id: input.economicRuleSetId, p_component_code: input.componentCode, p_working_state: input.workingState, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_ECONOMIC_RULE_COMPONENT_DENIED"); return { economicRuleComponentId: data };
}

export async function listSubdivisionEconomicRuleComponents(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionEconomicRuleComponentSummary[]> {
  const actorUserId = requireSubject(subjectId); const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_economic_rule_components", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_ECONOMIC_RULE_COMPONENT_READ_DENIED"); return data.map((row) => { const componentCode = String(row.component_code); const workingState = String(row.working_state); if (!componentCodes.includes(componentCode as ComponentCode) || !workingStates.includes(workingState as WorkingState)) throw new Error("SUBDIVISION_ECONOMIC_RULE_COMPONENT_READ_DENIED"); return { economicRuleComponentId: String(row.economic_rule_component_id), economicRuleSetId: String(row.economic_rule_set_id), componentCode: componentCode as ComponentCode, workingState: workingState as WorkingState, createdAt: String(row.created_at) }; });
}
