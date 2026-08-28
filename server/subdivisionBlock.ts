import type { SupabaseClient } from "@supabase/supabase-js";
import {
  draftSubdivisionBlockInputSchema,
  subdivisionContextSchema,
  type DraftSubdivisionBlockInput,
} from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

export type DraftSubdivisionBlockSummary = {
  blockId: string;
  developmentId: string;
  blockNumber: number;
  createdAt: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

export async function listDraftSubdivisionBlocks(subjectId: string | undefined, rawContext: unknown, developmentId: string, client: RpcClient = getSupabaseAdminClient()): Promise<DraftSubdivisionBlockSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_draft_blocks", {
    p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode, p_development_id: developmentId,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_BLOCK_READ_DENIED");
  return data.map((row) => ({ blockId: String(row.block_id), developmentId: String(row.development_id), blockNumber: Number(row.block_number), createdAt: String(row.created_at) }));
}

export async function createDraftSubdivisionBlock(subjectId: string | undefined, rawInput: DraftSubdivisionBlockInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ blockId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftSubdivisionBlockInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_create_draft_block", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId, p_block_number: input.blockNumber, p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_BLOCK_COMMAND_DENIED");
  return { blockId: data };
}
