import type { SupabaseClient } from "@supabase/supabase-js";
import { draftSubdivisionEconomicRuleComponentRoleReferenceInputSchema, subdivisionContextSchema, type DraftSubdivisionEconomicRuleComponentRoleReferenceInput } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
export type SubdivisionEconomicRuleComponentRoleReferenceSummary = { economicRuleComponentRoleReferenceId: string; economicRuleComponentId: string; internalPartyRoleLinkId: string; createdAt: string };
function requireSubject(subjectId: string | undefined) { if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED"); return subjectId; }

export async function addSubdivisionEconomicRuleComponentRoleReference(subjectId: string | undefined, rawInput: DraftSubdivisionEconomicRuleComponentRoleReferenceInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ economicRuleComponentRoleReferenceId: string }> {
  const actorUserId = requireSubject(subjectId); const input = draftSubdivisionEconomicRuleComponentRoleReferenceInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_add_economic_rule_component_role_reference", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_economic_rule_component_id: input.economicRuleComponentId, p_internal_party_role_link_id: input.internalPartyRoleLinkId, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_ECONOMIC_RULE_COMPONENT_ROLE_REFERENCE_DENIED"); return { economicRuleComponentRoleReferenceId: data };
}

export async function listSubdivisionEconomicRuleComponentRoleReferences(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionEconomicRuleComponentRoleReferenceSummary[]> {
  const actorUserId = requireSubject(subjectId); const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_economic_rule_component_role_references", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_ECONOMIC_RULE_COMPONENT_ROLE_REFERENCE_READ_DENIED");
  return data.map((row) => ({ economicRuleComponentRoleReferenceId: String(row.economic_rule_component_role_reference_id), economicRuleComponentId: String(row.economic_rule_component_id), internalPartyRoleLinkId: String(row.internal_party_role_link_id), createdAt: String(row.created_at) }));
}
