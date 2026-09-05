import type { SupabaseClient } from "@supabase/supabase-js";
import { subdivisionContextSchema } from "../shared/subdivisionContracts";
import {
  applySubdivisionDraftStructureInputSchema,
  archiveSubdivisionDraftBlockInputSchema,
  restoreSubdivisionDraftBlockInputSchema,
  type ArchiveSubdivisionDraftBlockInput,
  type ApplySubdivisionDraftStructureInput,
  type RestoreSubdivisionDraftBlockInput,
} from "../shared/subdivisionStructureBuilderContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

export type DraftSubdivisionStructureRow = {
  blockId: string;
  blockNumber: number;
  lotCount: number;
};

export type ArchivedDraftSubdivisionStructureRow = DraftSubdivisionStructureRow & {
  archivedLotCount: number;
};

export type DraftSubdivisionStructureResult = {
  blockCount: number;
  lotCount: number;
  archivedBlockCount: number;
  archivedLotCount: number;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

export async function listDraftSubdivisionStructure(
  subjectId: string | undefined,
  rawContext: unknown,
  developmentId: string,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<DraftSubdivisionStructureRow[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_draft_structure_v2", {
    p_actor_user_id: actorUserId,
    p_organization_id: context.organizationId,
    p_module: context.module,
    p_purpose_code: context.purposeCode,
    p_development_id: developmentId,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_STRUCTURE_READ_DENIED");
  return data.map((row) => ({
    blockId: String(row.block_id),
    blockNumber: Number(row.block_number),
    lotCount: Number(row.lot_count),
  }));
}

export async function applyDraftSubdivisionStructure(
  subjectId: string | undefined,
  rawInput: ApplySubdivisionDraftStructureInput,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<DraftSubdivisionStructureResult> {
  const actorUserId = requireSubject(subjectId);
  const input = applySubdivisionDraftStructureInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_apply_draft_structure_v2", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_blocks: input.blocks.map((block) => ({ block_number: block.blockNumber, lot_count: block.lotCount })),
    p_replace_existing: input.replaceExisting,
    p_correlation_id: input.correlationId,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("SUBDIVISION_STRUCTURE_COMMAND_DENIED");
  }
  const result = data as Record<string, unknown>;
  const values = ["block_count", "lot_count", "archived_block_count", "archived_lot_count"].map((key) => Number(result[key]));
  if (values.some((value) => !Number.isInteger(value) || value < 0)) throw new Error("SUBDIVISION_STRUCTURE_COMMAND_DENIED");
  return {
    blockCount: values[0],
    lotCount: values[1],
    archivedBlockCount: values[2],
    archivedLotCount: values[3],
  };
}

export async function archiveDraftSubdivisionBlock(
  subjectId: string | undefined,
  rawInput: ArchiveSubdivisionDraftBlockInput,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<{ blockId: string; archivedLotCount: number }> {
  const actorUserId = requireSubject(subjectId);
  const input = archiveSubdivisionDraftBlockInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_archive_draft_block_v2", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_block_id: input.blockId,
    p_correlation_id: input.correlationId,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("SUBDIVISION_STRUCTURE_COMMAND_DENIED");
  }
  const result = data as Record<string, unknown>;
  if (typeof result.block_id !== "string" || !Number.isInteger(Number(result.archived_lot_count)) || Number(result.archived_lot_count) < 0) {
    throw new Error("SUBDIVISION_STRUCTURE_COMMAND_DENIED");
  }
  return { blockId: result.block_id, archivedLotCount: Number(result.archived_lot_count) };
}

export async function listArchivedDraftSubdivisionStructure(
  subjectId: string | undefined,
  rawContext: unknown,
  developmentId: string,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<ArchivedDraftSubdivisionStructureRow[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_archived_draft_structure_v1", {
    p_actor_user_id: actorUserId,
    p_organization_id: context.organizationId,
    p_module: context.module,
    p_purpose_code: context.purposeCode,
    p_development_id: developmentId,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_STRUCTURE_READ_DENIED");
  return data.map((row) => ({
    blockId: String(row.block_id),
    blockNumber: Number(row.block_number),
    lotCount: Number(row.archived_lot_count),
    archivedLotCount: Number(row.archived_lot_count),
  }));
}

export async function restoreDraftSubdivisionBlock(
  subjectId: string | undefined,
  rawInput: RestoreSubdivisionDraftBlockInput,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<{ blockId: string; restoredLotCount: number }> {
  const actorUserId = requireSubject(subjectId);
  const input = restoreSubdivisionDraftBlockInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_restore_draft_block_v1", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_block_id: input.blockId,
    p_correlation_id: input.correlationId,
  });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) throw new Error("SUBDIVISION_STRUCTURE_COMMAND_DENIED");
  const result = data as Record<string, unknown>;
  if (typeof result.block_id !== "string" || !Number.isInteger(Number(result.restored_lot_count)) || Number(result.restored_lot_count) < 0) {
    throw new Error("SUBDIVISION_STRUCTURE_COMMAND_DENIED");
  }
  return { blockId: result.block_id, restoredLotCount: Number(result.restored_lot_count) };
}
