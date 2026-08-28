import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "./supabase";
import { storagePut } from "./storage";

type RpcClient = Pick<SupabaseClient, "rpc">;
type PrivateStorageWriter = (key: string, bytes: Buffer, contentType: string) => Promise<{ key: string }>;
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const maxBytes = 2 * 1024 * 1024;

function hasExpectedFileSignature(contentType: string, bytes: Buffer) {
  if (contentType === "application/pdf") return bytes.subarray(0, 5).equals(Buffer.from("%PDF-"));
  if (contentType === "image/jpeg") return bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (contentType === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return false;
}

export async function storePrivateBuyerAttachment(input: { subjectId?: string; organizationId: string; purposeCode: string; attachmentIntentId: string; correlationId: string; contentType: string; bytes: Buffer }, client: RpcClient = getSupabaseAdminClient(), writePrivateObject: PrivateStorageWriter = storagePut) {
  if (!input.subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  if (!allowedTypes.has(input.contentType) || input.bytes.byteLength < 1 || input.bytes.byteLength > maxBytes || !hasExpectedFileSignature(input.contentType, input.bytes)) throw new Error("SUBDIVISION_ATTACHMENT_UPLOAD_REJECTED");

  const authorization = await client.rpc("subdivision_authorize_buyer_attachment_upload", { p_actor_user_id: input.subjectId, p_organization_id: input.organizationId, p_module: "loteadora", p_purpose_code: input.purposeCode, p_attachment_intent_id: input.attachmentIntentId });
  if (authorization.error || typeof authorization.data !== "string") throw new Error("SUBDIVISION_ATTACHMENT_UPLOAD_DENIED");

  const stored = await writePrivateObject(`private/${input.organizationId}/buyer-attachments/${input.attachmentIntentId}`, input.bytes, input.contentType);
  const { data, error } = await client.rpc("subdivision_record_buyer_attachment_upload", { p_actor_user_id: input.subjectId, p_organization_id: input.organizationId, p_module: "loteadora", p_purpose_code: input.purposeCode, p_attachment_intent_id: input.attachmentIntentId, p_storage_key: stored.key, p_content_type: input.contentType, p_byte_size: input.bytes.byteLength, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") {
    console.warn("[Private attachment upload] Metadata registration denied after private storage write");
    throw new Error("SUBDIVISION_ATTACHMENT_UPLOAD_DENIED");
  }
  return { attachmentIntentId: data };
}
