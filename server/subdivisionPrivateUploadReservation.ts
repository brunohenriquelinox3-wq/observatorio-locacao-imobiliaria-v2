import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "./supabase";

const targetKinds = [
  "buyer_attachment",
  "sale_case_document",
  "development_attachment",
] as const;

export type SubdivisionPrivateUploadTargetKind = (typeof targetKinds)[number];

type RpcClient = Pick<SupabaseClient, "rpc">;

type ReserveInput = {
  subjectId: string;
  organizationId: string;
  purposeCode: string;
  targetKind: SubdivisionPrivateUploadTargetKind;
  targetId: string;
  contentType: string;
  byteSize: number;
  correlationId: string;
};

export async function reserveSubdivisionPrivateUploadStorage(
  input: ReserveInput,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<{ storageKey: string }> {
  const { data, error } = await client.rpc("subdivision_reserve_private_upload_storage", {
    p_actor_user_id: input.subjectId,
    p_organization_id: input.organizationId,
    p_module: "loteadora",
    p_purpose_code: input.purposeCode,
    p_target_kind: input.targetKind,
    p_target_id: input.targetId,
    p_content_type: input.contentType,
    p_byte_size: input.byteSize,
    p_correlation_id: input.correlationId,
  });

  if (error || typeof data !== "string" || !data.startsWith("private/")) {
    throw new Error("SUBDIVISION_PRIVATE_UPLOAD_RESERVATION_DENIED");
  }

  return { storageKey: data };
}
