import type { SupabaseClient } from "@supabase/supabase-js";
import { draftUrbanDevelopmentInputSchema, type DraftUrbanDevelopmentInput } from "../shared/urbanDevelopmentContracts";
import { urbanSalesContextSchema } from "../shared/urbanPipelineContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type DevelopmentKind = "condominium" | "tower" | "mixed_use" | "single_building" | "other";
type DevelopmentPhase = "reference" | "structuring" | "review_required";

export type DraftUrbanDevelopmentSummary = { developmentId: string; internalReference: string; developmentKind: DevelopmentKind; workingPhase: DevelopmentPhase; createdAt: string };

function requireSubject(subjectId: string | undefined): string { if (!subjectId) throw new Error("URBAN_IDENTITY_REQUIRED"); return subjectId; }

export async function listDraftUrbanDevelopments(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<DraftUrbanDevelopmentSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = urbanSalesContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("urban_list_draft_developments", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("URBAN_DEVELOPMENT_READ_DENIED");
  return data.map((row) => ({
    developmentId: String(row.development_id), internalReference: String(row.internal_reference),
    developmentKind: ["condominium", "tower", "mixed_use", "single_building"].includes(String(row.development_kind)) ? String(row.development_kind) as DevelopmentKind : "other",
    workingPhase: ["structuring", "review_required"].includes(String(row.working_phase)) ? String(row.working_phase) as DevelopmentPhase : "reference",
    createdAt: String(row.created_at),
  }));
}

export async function createDraftUrbanDevelopment(subjectId: string | undefined, rawInput: DraftUrbanDevelopmentInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ developmentId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftUrbanDevelopmentInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("urban_create_draft_development", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_internal_reference: input.internalReference, p_development_kind: input.developmentKind, p_working_phase: input.workingPhase, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("URBAN_DEVELOPMENT_COMMAND_DENIED");
  return { developmentId: data };
}
