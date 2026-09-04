import type { SupabaseClient } from "@supabase/supabase-js";
import { draftUrbanDevelopmentDeveloperLinkInputSchema, draftUrbanDevelopmentInputSchema, draftUrbanDevelopmentStructureInputSchema, draftUrbanDeveloperInputSchema, type DraftUrbanDevelopmentDeveloperLinkInput, type DraftUrbanDevelopmentInput, type DraftUrbanDevelopmentStructureInput, type DraftUrbanDeveloperInput } from "../shared/urbanDevelopmentContracts";
import { urbanSalesContextSchema } from "../shared/urbanPipelineContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type DevelopmentKind = "condominium" | "tower" | "mixed_use" | "single_building" | "other";
type DevelopmentPhase = "reference" | "structuring" | "review_required";

export type DraftUrbanDevelopmentSummary = { developmentId: string; internalReference: string; developmentKind: DevelopmentKind; workingPhase: DevelopmentPhase; createdAt: string };
export type DraftUrbanDeveloperSummary = { developerProfileId: string; partyId: string; displayName: string; createdAt: string };
export type DraftUrbanDevelopmentDeveloperLinkSummary = { linkId: string; developmentId: string; developmentReference: string; developerProfileId: string; displayName: string; relationship: "development_responsible" | "commercial_reference" | "other"; createdAt: string };
export type DraftUrbanDevelopmentStructureSummary = { structureId: string; developmentId: string; developmentReference: string; internalReference: string; structureKind: "tower" | "block"; createdAt: string };

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

export async function listDraftUrbanDevelopers(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<DraftUrbanDeveloperSummary[]> {
  const actorUserId = requireSubject(subjectId); const context = urbanSalesContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("urban_list_draft_developers", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("URBAN_DEVELOPER_READ_DENIED");
  return data.map((row) => ({ developerProfileId: String(row.developer_profile_id), partyId: String(row.party_id), displayName: String(row.display_name), createdAt: String(row.created_at) }));
}

export async function registerDraftUrbanDeveloper(subjectId: string | undefined, rawInput: DraftUrbanDeveloperInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ developerProfileId: string }> {
  const actorUserId = requireSubject(subjectId); const input = draftUrbanDeveloperInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("urban_register_draft_developer", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_party_id: input.partyId, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("URBAN_DEVELOPER_COMMAND_DENIED");
  return { developerProfileId: data };
}

export async function listDraftUrbanDevelopmentDeveloperLinks(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<DraftUrbanDevelopmentDeveloperLinkSummary[]> {
  const actorUserId = requireSubject(subjectId); const context = urbanSalesContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("urban_list_draft_development_developers", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("URBAN_DEVELOPER_LINK_READ_DENIED");
  return data.map((row) => ({ linkId: String(row.link_id), developmentId: String(row.development_id), developmentReference: String(row.development_reference), developerProfileId: String(row.developer_profile_id), displayName: String(row.display_name), relationship: ["development_responsible", "commercial_reference"].includes(String(row.relationship)) ? String(row.relationship) as "development_responsible" | "commercial_reference" : "other", createdAt: String(row.created_at) }));
}

export async function linkDraftUrbanDevelopmentDeveloper(subjectId: string | undefined, rawInput: DraftUrbanDevelopmentDeveloperLinkInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ linkId: string }> {
  const actorUserId = requireSubject(subjectId); const input = draftUrbanDevelopmentDeveloperLinkInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("urban_link_draft_development_developer", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_development_id: input.developmentId, p_developer_profile_id: input.developerProfileId, p_relationship: input.relationship, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("URBAN_DEVELOPER_LINK_COMMAND_DENIED");
  return { linkId: data };
}

export async function listDraftUrbanDevelopmentStructures(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<DraftUrbanDevelopmentStructureSummary[]> {
  const actorUserId = requireSubject(subjectId); const context = urbanSalesContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("urban_list_draft_development_structures", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("URBAN_DEVELOPMENT_STRUCTURE_READ_DENIED");
  return data.map((row) => ({ structureId: String(row.structure_id), developmentId: String(row.development_id), developmentReference: String(row.development_reference), internalReference: String(row.internal_reference), structureKind: row.structure_kind === "block" ? "block" : "tower", createdAt: String(row.created_at) }));
}

export async function createDraftUrbanDevelopmentStructure(subjectId: string | undefined, rawInput: DraftUrbanDevelopmentStructureInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ structureId: string }> {
  const actorUserId = requireSubject(subjectId); const input = draftUrbanDevelopmentStructureInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("urban_create_draft_development_structure", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_development_id: input.developmentId, p_internal_reference: input.internalReference, p_structure_kind: input.structureKind, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("URBAN_DEVELOPMENT_STRUCTURE_COMMAND_DENIED");
  return { structureId: data };
}
