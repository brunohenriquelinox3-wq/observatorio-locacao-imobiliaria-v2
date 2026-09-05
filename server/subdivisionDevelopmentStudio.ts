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
type ParcelingMode = "loteamento" | "desmembramento" | "condominio_lotes" | "acesso_controlado" | "other" | "to_review";
type TerritorialContext = "urban" | "urban_expansion" | "specific_urbanization" | "to_review";
type PredominantUse = "residential" | "mixed_use" | "commercial" | "industrial" | "institutional" | "to_review";

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
  parcelingMode: ParcelingMode | null;
  territorialContext: TerritorialContext | null;
  predominantUse: PredominantUse | null;
  territorialReference: string | null;
  identificationNote: string | null;
  createdAt: string;
  updatedAt: string;
};

const developmentKinds: DevelopmentKind[] = ["residential", "mixed_use", "commercial", "industrial", "rural", "other"];
const workingPhases: WorkingPhase[] = ["preliminary_reference", "structuring", "review_required"];
const parcelingModes: ParcelingMode[] = ["loteamento", "desmembramento", "condominio_lotes", "acesso_controlado", "other", "to_review"];
const territorialContexts: TerritorialContext[] = ["urban", "urban_expansion", "specific_urbanization", "to_review"];
const predominantUses: PredominantUse[] = ["residential", "mixed_use", "commercial", "industrial", "institutional", "to_review"];

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

function mapSummary(row: Record<string, unknown>): SubdivisionDevelopmentStudioSummary {
  const developmentKind = row.development_kind === null ? null : String(row.development_kind) as DevelopmentKind;
  const workingPhase = String(row.working_phase) as WorkingPhase;
  const parcelingMode = row.parceling_mode === null ? null : String(row.parceling_mode) as ParcelingMode;
  const territorialContext = row.territorial_context === null ? null : String(row.territorial_context) as TerritorialContext;
  const predominantUse = row.predominant_use === null ? null : String(row.predominant_use) as PredominantUse;
  if ((developmentKind !== null && !developmentKinds.includes(developmentKind)) || !workingPhases.includes(workingPhase) || (parcelingMode !== null && !parcelingModes.includes(parcelingMode)) || (territorialContext !== null && !territorialContexts.includes(territorialContext)) || (predominantUse !== null && !predominantUses.includes(predominantUse))) {
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
    parcelingMode,
    territorialContext,
    predominantUse,
    territorialReference: row.territorial_reference === null ? null : String(row.territorial_reference),
    identificationNote: row.identification_note === null ? null : String(row.identification_note),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export async function listSubdivisionDevelopmentStudio(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionDevelopmentStudioSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_draft_developments_v3", {
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
  const { data, error } = await client.rpc("subdivision_create_draft_development_v3", {
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
    p_parceling_mode: input.parcelingMode,
    p_territorial_context: input.territorialContext,
    p_predominant_use: input.predominantUse,
    p_territorial_reference: input.territorialReference,
    p_identification_note: input.identificationNote,
   p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_DEVELOPMENT_COMMAND_DENIED");
  return { developmentId: data };
}

export async function updateSubdivisionDevelopmentStudio(subjectId: string | undefined, rawInput: UpdateSubdivisionDevelopmentStudioInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ developmentId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = updateSubdivisionDevelopmentStudioInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_update_draft_development_v3", {
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
    p_parceling_mode: input.parcelingMode,
    p_territorial_context: input.territorialContext,
    p_predominant_use: input.predominantUse,
    p_territorial_reference: input.territorialReference,
    p_identification_note: input.identificationNote,
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
