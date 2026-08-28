import type { SupabaseClient } from "@supabase/supabase-js";
import {
  draftSubdivisionDevelopmentInputSchema,
  subdivisionContextSchema,
  type DraftSubdivisionDevelopmentInput,
} from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type WorkingPhase = "preliminary_reference" | "structuring" | "review_required";

export type DraftSubdivisionDevelopmentSummary = {
  developmentId: string;
  internalReference: string;
  workingPhase: WorkingPhase;
  createdAt: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

const workingPhases: WorkingPhase[] = ["preliminary_reference", "structuring", "review_required"];

export async function listDraftSubdivisionDevelopments(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<DraftSubdivisionDevelopmentSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_draft_developments", {
    p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_DEVELOPMENT_READ_DENIED");
  return data.map((row) => ({
    developmentId: String(row.development_id),
    internalReference: String(row.internal_reference),
    workingPhase: workingPhases.includes(String(row.working_phase) as WorkingPhase) ? String(row.working_phase) as WorkingPhase : "preliminary_reference",
    createdAt: String(row.created_at),
  }));
}

export async function createDraftSubdivisionDevelopment(subjectId: string | undefined, rawInput: DraftSubdivisionDevelopmentInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ developmentId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftSubdivisionDevelopmentInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_create_draft_development", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_internal_reference: input.internalReference, p_working_phase: input.workingPhase, p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_DEVELOPMENT_COMMAND_DENIED");
  return { developmentId: data };
}
