import type { SupabaseClient } from "@supabase/supabase-js";
import {
  draftSubdivisionDevelopmentPreparationProfileInputSchema,
  subdivisionContextSchema,
  type DraftSubdivisionDevelopmentPreparationProfileInput,
} from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type PlanningState = "reference" | "internal_study" | "project_preparation" | "internal_review";
type CompliancePreparationState = "not_started" | "internal_organization" | "evidence_for_review";
type ImplementationPreparationState = "not_started" | "internal_planning" | "review_required";

export type DraftSubdivisionDevelopmentPreparationProfileSummary = {
  preparationProfileId: string;
  developmentId: string;
  planningState: PlanningState;
  municipalPreparationState: CompliancePreparationState;
  registrationPreparationState: CompliancePreparationState;
  implementationPreparationState: ImplementationPreparationState;
  responsibleInternalPartyRoleId: string | null;
  updatedAt: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

const planningStates: PlanningState[] = ["reference", "internal_study", "project_preparation", "internal_review"];
const compliancePreparationStates: CompliancePreparationState[] = ["not_started", "internal_organization", "evidence_for_review"];
const implementationPreparationStates: ImplementationPreparationState[] = ["not_started", "internal_planning", "review_required"];

export async function listDraftSubdivisionDevelopmentPreparationProfiles(
  subjectId: string | undefined,
  rawContext: unknown,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<DraftSubdivisionDevelopmentPreparationProfileSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_draft_development_preparation_profiles", {
    p_actor_user_id: actorUserId,
    p_organization_id: context.organizationId,
    p_module: context.module,
    p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_PREPARATION_PROFILE_READ_DENIED");
  return data.map((row) => {
    const planningState = String(row.planning_state) as PlanningState;
    const municipalPreparationState = String(row.municipal_preparation_state) as CompliancePreparationState;
    const registrationPreparationState = String(row.registration_preparation_state) as CompliancePreparationState;
    const implementationPreparationState = String(row.implementation_preparation_state) as ImplementationPreparationState;
    if (!planningStates.includes(planningState) || !compliancePreparationStates.includes(municipalPreparationState) || !compliancePreparationStates.includes(registrationPreparationState) || !implementationPreparationStates.includes(implementationPreparationState)) {
      throw new Error("SUBDIVISION_PREPARATION_PROFILE_READ_DENIED");
    }
    return {
      preparationProfileId: String(row.preparation_profile_id),
      developmentId: String(row.development_id),
      planningState,
      municipalPreparationState,
      registrationPreparationState,
      implementationPreparationState,
      responsibleInternalPartyRoleId: row.responsible_internal_party_role_id ? String(row.responsible_internal_party_role_id) : null,
      updatedAt: String(row.updated_at),
    };
  });
}

export async function upsertDraftSubdivisionDevelopmentPreparationProfile(
  subjectId: string | undefined,
  rawInput: DraftSubdivisionDevelopmentPreparationProfileInput,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<{ preparationProfileId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftSubdivisionDevelopmentPreparationProfileInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_upsert_draft_development_preparation_profile", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_planning_state: input.planningState,
    p_municipal_preparation_state: input.municipalPreparationState,
    p_registration_preparation_state: input.registrationPreparationState,
    p_implementation_preparation_state: input.implementationPreparationState,
    p_responsible_internal_party_role_id: input.responsibleInternalPartyRoleId,
    p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_PREPARATION_PROFILE_COMMAND_DENIED");
  return { preparationProfileId: data };
}
