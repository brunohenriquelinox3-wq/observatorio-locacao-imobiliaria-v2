import type { SupabaseClient } from "@supabase/supabase-js";
import { clientImportCommitInputSchema, type ClientImportCommitInput } from "../shared/clientImportContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

export type ClientImportCommitResult = {
  acceptedRows: number;
  createdRows: number;
  duplicateRows: number;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("CLIENT_IMPORT_IDENTITY_REQUIRED");
  return subjectId;
}

export async function commitClientImport(
  subjectId: string | undefined,
  rawInput: ClientImportCommitInput,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<ClientImportCommitResult> {
  const actorUserId = requireSubject(subjectId);
  const input = clientImportCommitInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("client_import_draft_parties", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_rows: input.rows,
    p_file_fingerprint: input.fileFingerprint,
    p_correlation_id: input.correlationId,
  });

  if (error || !Array.isArray(data) || data.length !== 1) {
    throw new Error("CLIENT_IMPORT_COMMAND_DENIED");
  }

  const result = data[0] as Record<string, unknown>;
  const acceptedRows = Number(result.accepted_rows);
  const createdRows = Number(result.created_rows);
  const duplicateRows = Number(result.duplicate_rows);
  if (![acceptedRows, createdRows, duplicateRows].every(Number.isInteger)) {
    throw new Error("CLIENT_IMPORT_COMMAND_DENIED");
  }

  return { acceptedRows, createdRows, duplicateRows };
}
