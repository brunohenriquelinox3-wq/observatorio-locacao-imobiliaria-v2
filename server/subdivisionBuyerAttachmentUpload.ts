import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "./supabase";
import { storagePut } from "./storage";

type RpcClient = Pick<SupabaseClient, "rpc">;
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const maxBytes = 2 * 1024 * 1024;

export async function storePrivateBuyerAttachment(input: { subjectId?: string; organizationId: string; purposeCode: string; attachmentIntentId: string; correlationId: string; contentType: string; bytes: Buffer }, client: RpcClient = getSupabaseAdminClient()) {
  if (!input.subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  if (!allowedTypes.has(input.contentType) || input.bytes.byteLength < 1 || input.bytes.byteLength > maxBytes) throw new Error("SUBDIVISION_ATTACHMENT_UPLOAD_REJECTED");
  const stored = await storagePut(`private/${input.organizationId}/buyer-attachments/${input.attachmentIntentId}`, input.bytes, input.contentType);
  const { data, error } = await client.rpc("subdivision_record_buyer_attachment_upload", { p_actor_user_id: input.subjectId, p_organization_id: input.organizationId, p_module: "loteadora", p_purpose_code: input.purposeCode, p_attachment_intent_id: input.attachmentIntentId, p_storage_key: stored.key, p_content_type: input.contentType, p_byte_size: input.bytes.byteLength, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_ATTACHMENT_UPLOAD_DENIED");
  return { attachmentIntentId: data };
}
