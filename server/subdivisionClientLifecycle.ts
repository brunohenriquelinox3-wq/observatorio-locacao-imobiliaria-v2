import type { SupabaseClient } from "@supabase/supabase-js";
import {
  archiveSubdivisionClientInputSchema,
  registerSubdivisionClientDirectInputSchema,
  restoreSubdivisionClientInputSchema,
  subdivisionContextSchema,
  type ArchiveSubdivisionClientInput,
  type RegisterSubdivisionClientDirectInput,
  type RestoreSubdivisionClientInput,
} from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type RpcRow = Record<string, unknown>;

export type ArchivedSubdivisionClient = {
  buyerClientId: string;
  displayName: string;
  archivedAt: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

function parseActionResult(data: unknown): { buyerClientId: string; lifecycleState: "draft" | "archived" } {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("SUBDIVISION_CLIENT_LIFECYCLE_COMMAND_DENIED");
  const row = data as RpcRow;
  if (typeof row.buyer_client_id !== "string" || (row.lifecycle_state !== "draft" && row.lifecycle_state !== "archived")) {
    throw new Error("SUBDIVISION_CLIENT_LIFECYCLE_COMMAND_DENIED");
  }
  return { buyerClientId: row.buyer_client_id, lifecycleState: row.lifecycle_state };
}

export async function registerSubdivisionClientDirect(subjectId: string | undefined, rawInput: RegisterSubdivisionClientDirectInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ buyerClientId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = registerSubdivisionClientDirectInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_register_client_direct", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module,
    p_purpose_code: input.purposeCode, p_party_kind: input.partyKind, p_display_name: input.displayName,
    p_correlation_id: input.correlationId,
  });
  if (error || !Array.isArray(data) || data.length !== 1 || !data[0] || typeof data[0] !== "object") throw new Error("SUBDIVISION_CLIENT_DIRECT_COMMAND_DENIED");
  const row = data[0] as RpcRow;
  if (typeof row.client_id !== "string") throw new Error("SUBDIVISION_CLIENT_DIRECT_COMMAND_DENIED");
  return { buyerClientId: row.client_id };
}

export async function archiveSubdivisionClient(subjectId: string | undefined, rawInput: ArchiveSubdivisionClientInput, client: RpcClient = getSupabaseAdminClient()) {
  const actorUserId = requireSubject(subjectId);
  const input = archiveSubdivisionClientInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_archive_client", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module,
    p_purpose_code: input.purposeCode, p_client_id: input.buyerClientId, p_correlation_id: input.correlationId,
  });
  if (error) throw new Error("SUBDIVISION_CLIENT_ARCHIVE_DENIED");
  return parseActionResult(data);
}

export async function restoreSubdivisionClient(subjectId: string | undefined, rawInput: RestoreSubdivisionClientInput, client: RpcClient = getSupabaseAdminClient()) {
  const actorUserId = requireSubject(subjectId);
  const input = restoreSubdivisionClientInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_restore_client", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module,
    p_purpose_code: input.purposeCode, p_client_id: input.buyerClientId, p_correlation_id: input.correlationId,
  });
  if (error) throw new Error("SUBDIVISION_CLIENT_RESTORE_DENIED");
  return parseActionResult(data);
}

export async function listArchivedSubdivisionClients(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<ArchivedSubdivisionClient[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_archived_clients", {
    p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_CLIENT_ARCHIVE_READ_DENIED");
  return data.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error("SUBDIVISION_CLIENT_ARCHIVE_READ_DENIED");
    const row = item as RpcRow;
    if (typeof row.client_id !== "string" || typeof row.display_name !== "string" || typeof row.archived_at !== "string") throw new Error("SUBDIVISION_CLIENT_ARCHIVE_READ_DENIED");
    return { buyerClientId: row.client_id, displayName: row.display_name, archivedAt: row.archived_at };
  });
}
