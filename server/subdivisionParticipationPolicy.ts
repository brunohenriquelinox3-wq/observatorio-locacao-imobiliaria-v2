import type { SupabaseClient } from "@supabase/supabase-js";
import { subdivisionContextSchema } from "../shared/subdivisionContracts";
import { addSubdivisionParticipationPolicyRuleInputSchema, addSubdivisionParticipationRuleLotScopeInputSchema, activateSubdivisionParticipationPolicyVersionInputSchema, createSubdivisionParticipationPolicyVersionInputSchema, lookupSubdivisionInternalPartyByFiscalReferenceInputSchema, upsertSubdivisionInternalPartyProfileInputSchema, type AddSubdivisionParticipationPolicyRuleInput, type CreateSubdivisionParticipationPolicyVersionInput, type LookupSubdivisionInternalPartyByFiscalReferenceInput, type UpsertSubdivisionInternalPartyProfileInput } from "../shared/subdivisionParticipationContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
const subject = (value: string | undefined) => { if (!value) throw new Error("SUBDIVISION_IDENTITY_REQUIRED"); return value; };
const asInteger = (value: unknown) => { const parsed = Number(value); if (!Number.isSafeInteger(parsed)) throw new Error("SUBDIVISION_PARTICIPATION_READ_DENIED"); return parsed; };

export async function upsertSubdivisionInternalPartyProfile(subjectId: string | undefined, raw: UpsertSubdivisionInternalPartyProfileInput, client: RpcClient = getSupabaseAdminClient()) {
  const actor = subject(subjectId); const input = upsertSubdivisionInternalPartyProfileInputSchema.parse(raw);
  const { data, error } = await client.rpc("subdivision_upsert_internal_party_profile", { p_actor_user_id: actor, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_party_role_assignment_id: input.partyRoleAssignmentId, p_document_reference: input.documentReference, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_INTERNAL_PARTY_PROFILE_DENIED"); return { profileId: data };
}
export async function lookupSubdivisionInternalPartyByFiscalReference(subjectId: string | undefined, raw: LookupSubdivisionInternalPartyByFiscalReferenceInput, client: RpcClient = getSupabaseAdminClient()) {
  const actor = subject(subjectId); const input = lookupSubdivisionInternalPartyByFiscalReferenceInputSchema.parse(raw);
  const { data, error } = await client.rpc("subdivision_lookup_internal_party_by_fiscal_reference", { p_actor_user_id: actor, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_development_id: input.developmentId, p_document_reference: input.documentReference, p_correlation_id: input.correlationId });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_INTERNAL_PARTY_LOOKUP_DENIED"); if (!data.length) return null;
  const row = data[0]; if (!row || typeof row.internal_party_role_link_id !== "string" || typeof row.display_name !== "string") throw new Error("SUBDIVISION_INTERNAL_PARTY_LOOKUP_DENIED");
  return { internalPartyRoleLinkId: row.internal_party_role_link_id, partyRoleAssignmentId: String(row.party_role_assignment_id), displayName: row.display_name, role: String(row.role), partyKind: String(row.party_kind) };
}
export async function createSubdivisionParticipationPolicyVersion(subjectId: string | undefined, raw: CreateSubdivisionParticipationPolicyVersionInput, client: RpcClient = getSupabaseAdminClient()) {
  const actor = subject(subjectId); const input = createSubdivisionParticipationPolicyVersionInputSchema.parse(raw);
  const { data, error } = await client.rpc("subdivision_create_participation_policy_version", { p_actor_user_id: actor, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_development_id: input.developmentId, p_valid_from: input.validFrom, p_valid_until: input.validUntil, p_require_full_allocation: input.requireFullAllocation, p_correlation_id: input.correlationId });
  if (error || !data || typeof data !== "object") throw new Error("SUBDIVISION_PARTICIPATION_POLICY_DENIED"); const row = data as Record<string, unknown>; if (typeof row.policy_version_id !== "string" || row.state !== "draft") throw new Error("SUBDIVISION_PARTICIPATION_POLICY_DENIED"); return { policyVersionId: row.policy_version_id, versionNumber: asInteger(row.version_number), state: "draft" as const };
}
export async function addSubdivisionParticipationPolicyRule(subjectId: string | undefined, raw: AddSubdivisionParticipationPolicyRuleInput, client: RpcClient = getSupabaseAdminClient()) {
  const actor = subject(subjectId); const input = addSubdivisionParticipationPolicyRuleInputSchema.parse(raw);
  const { data, error } = await client.rpc("subdivision_add_participation_policy_rule", { p_actor_user_id: actor, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_policy_version_id: input.policyVersionId, p_internal_party_role_link_id: input.internalPartyRoleLinkId, p_allocation_method: input.allocationMethod, p_percentage_basis_points: input.percentageBasisPoints, p_fixed_amount_cents: input.fixedAmountCents, p_cap_total_cents: input.capTotalCents, p_applies_to_all_lots: input.appliesToAllLots, p_schedule_kinds: input.scheduleKinds, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_PARTICIPATION_RULE_DENIED"); return { ruleId: data };
}
export async function addSubdivisionParticipationRuleLotScope(subjectId: string | undefined, raw: unknown, client: RpcClient = getSupabaseAdminClient()) {
  const actor = subject(subjectId); const input = addSubdivisionParticipationRuleLotScopeInputSchema.parse(raw);
  const { data, error } = await client.rpc("subdivision_add_participation_rule_lot_scope", { p_actor_user_id: actor, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_rule_id: input.ruleId, p_lot_id: input.lotId, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_PARTICIPATION_RULE_SCOPE_DENIED"); return { scopeId: data };
}
export async function activateSubdivisionParticipationPolicyVersion(subjectId: string | undefined, raw: unknown, client: RpcClient = getSupabaseAdminClient()) {
  const actor = subject(subjectId); const input = activateSubdivisionParticipationPolicyVersionInputSchema.parse(raw);
  const { data, error } = await client.rpc("subdivision_activate_participation_policy_version", { p_actor_user_id: actor, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_policy_version_id: input.policyVersionId, p_correlation_id: input.correlationId });
  if (error || !data || typeof data !== "object" || (data as Record<string, unknown>).state !== "active") throw new Error("SUBDIVISION_PARTICIPATION_POLICY_ACTIVATION_DENIED"); return { policyVersionId: input.policyVersionId, state: "active" as const };
}
export async function listSubdivisionParticipationPolicyVersions(subjectId: string | undefined, raw: unknown, client: RpcClient = getSupabaseAdminClient()) {
  const actor = subject(subjectId); const context = subdivisionContextSchema.parse(raw); const { data, error } = await client.rpc("subdivision_list_participation_policy_versions", { p_actor_user_id: actor, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_PARTICIPATION_READ_DENIED"); return data.map((row) => ({ policyVersionId: String(row.policy_version_id), developmentId: String(row.development_id), versionNumber: asInteger(row.version_number), state: String(row.state), validFrom: String(row.valid_from), validUntil: row.valid_until ? String(row.valid_until) : null, requireFullAllocation: Boolean(row.require_full_allocation), ruleCount: asInteger(row.rule_count), createdAt: String(row.created_at), activatedAt: row.activated_at ? String(row.activated_at) : null }));
}
export async function listSubdivisionParticipationPolicyRules(subjectId: string | undefined, raw: unknown, client: RpcClient = getSupabaseAdminClient()) {
  const actor = subject(subjectId); const context = subdivisionContextSchema.parse(raw); const { data, error } = await client.rpc("subdivision_list_participation_policy_rules", { p_actor_user_id: actor, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_PARTICIPATION_READ_DENIED"); return data.map((row) => ({ ruleId: String(row.rule_id), policyVersionId: String(row.policy_version_id), internalPartyRoleLinkId: String(row.internal_party_role_link_id), displayName: String(row.display_name), role: String(row.role), allocationMethod: String(row.allocation_method), percentageBasisPoints: row.percentage_basis_points === null ? null : asInteger(row.percentage_basis_points), fixedAmountCents: row.fixed_amount_cents === null ? null : asInteger(row.fixed_amount_cents), capTotalCents: row.cap_total_cents === null ? null : asInteger(row.cap_total_cents), appliesToAllLots: Boolean(row.applies_to_all_lots), scheduleKinds: Array.isArray(row.schedule_kinds) ? row.schedule_kinds.map(String) : [], scopedLotCount: asInteger(row.scoped_lot_count), createdAt: String(row.created_at) }));
}
