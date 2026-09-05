import type { SupabaseClient } from "@supabase/supabase-js";
import {
  archiveSubdivisionDevelopmentStudioInputSchema,
  createSubdivisionDevelopmentStudioInputSchema,
  updateSubdivisionDevelopmentStudioInputSchema,
  type ArchiveSubdivisionDevelopmentStudioInput,
  type CreateSubdivisionDevelopmentStudioInput,
  type UpdateSubdivisionDevelopmentStudioInput,
} from "../shared/subdivisionDevelopmentStudioContracts";
import { subdivisionContextSchema } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type DevelopmentKind = "residential" | "mixed_use" | "commercial" | "industrial" | "rural" | "other";
type WorkingPhase = "preliminary_reference" | "structuring" | "review_required";

export type SubdivisionDevelopmentStudioSummary = {
  developmentId: string;
  internalReference: string;
  displayName: string | null;
  developmentKind: DevelopmentKind | null;
  municipality: string | null;
  stateCode: string | null;
  plannedStageCount: number | null;
  workingPhase: WorkingPhase;
  internalNote: string | null;
  createdAt: string;
  updatedAt: string;
};

const developmentKinds: DevelopmentKind[] = ["residential", "mixed_use", "commercial", "industrial", "rural", "other"];
const workingPhases: WorkingPhase[] = ["preliminary_reference", "structuring", "review_required"];

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

function mapSummary(row: Record<string, unknown>): SubdivisionDevelopmentStudioSummary {
  const developmentKind = row.development_kind === null ? null : String(row.development_kind) as DevelopmentKind;
  const workingPhase = String(row.working_phase) as WorkingPhase;
  if ((developmentKind !== null && !developmentKinds.includes(developmentKind)) || !workingPhases.includes(workingPhase)) {
    throw new Error("SUBDIVISION_DEVELOPMENT_READ_DENIED");
  }
  return {
    developmentId: String(row.development_id),
    internalReference: String(row.internal_reference),
    displayName: row.display_name === null ? null : String(row.display_name),
    developmentKind,
    municipality: row.municipality === null ? null : String(row.municipality),
    stateCode: row.state_code === null ? null : String(row.state_code),
    plannedStageCount: row.planned_stage_count === null ? null : Number(row.planned_stage_count),
    workingPhase,
    internalNote: row.internal_note === null ? null : String(row.internal_note),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function listSubdivisionDevelopmentStudio(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionDevelopmentStudioSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_draft_developments_v2", {
    p_actor_user_id: actorUserId,
    p_organization_id: context.organizationId,
    p_module: context.module,
    p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_DEVELOPMENT_READ_DENIED");
  return data.map((row) => mapSummary(row as Record<string, unknown>));
}

export async function createSubdivisionDevelopmentStudio(subjectId: string | undefined, rawInput: CreateSubdivisionDevelopmentStudioInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ developmentId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = createSubdivisionDevelopmentStudioInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_create_draft_development_v2", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_internal_reference: input.internalReference,
    p_display_name: input.displayName,
    p_development_kind: input.developmentKind,
    p_municipality: input.municipality,
    p_state_code: input.stateCode,
    p_planned_stage_count: input.plannedStageCount,
    p_working_phase: input.workingPhase,
    p_internal_note: input.internalNote,
    p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_DEVELOPMENT_COMMAND_DENIED");
  return { developmentId: data };
}

export async function updateSubdivisionDevelopmentStudio(subjectId: string | undefined, rawInput: UpdateSubdivisionDevelopmentStudioInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ developmentId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = updateSubdivisionDevelopmentStudioInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_update_draft_development_v2", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_internal_reference: input.internalReference,
    p_display_name: input.displayName,
    p_development_kind: input.developmentKind,
    p_municipality: input.municipality,
    p_state_code: input.stateCode,
    p_planned_stage_count: input.plannedStageCount,
    p_working_phase: input.workingPhase,
    p_internal_note: input.internalNote,
    p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_DEVELOPMENT_COMMAND_DENIED");
  return { developmentId: data };
}

export async function archiveSubdivisionDevelopmentStudio(subjectId: string | undefined, rawInput: ArchiveSubdivisionDevelopmentStudioInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ developmentId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = archiveSubdivisionDevelopmentStudioInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_archive_draft_development_v2", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_DEVELOPMENT_COMMAND_DENIED");
  return { developmentId: data };
}
