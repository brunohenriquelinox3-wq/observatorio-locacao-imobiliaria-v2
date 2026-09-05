import type { SupabaseClient } from "@supabase/supabase-js";
import {
  archiveSubdivisionDevelopmentAttachmentInputSchema,
  createSubdivisionDevelopmentAttachmentIntentInputSchema,
  type ArchiveSubdivisionDevelopmentAttachmentInput,
  type CreateSubdivisionDevelopmentAttachmentIntentInput,
} from "../shared/subdivisionDevelopmentStudioContracts";
import { subdivisionContextSchema } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";
import { storagePut } from "./storage";

type RpcClient = Pick<SupabaseClient, "rpc">;
type PrivateStorageWriter = (key: string, bytes: Buffer, contentType: string) => Promise<{ key: string }>;
type AttachmentState = "awaiting_upload" | "recorded";
type AttachmentCategory = "planning" | "municipal" | "registry" | "implementation" | "environmental" | "other";
const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
const maxBytes = 5 * 1024 * 1024;

export type SubdivisionDevelopmentAttachmentSummary = {
  attachmentId: string;
  category: AttachmentCategory;
  state: AttachmentState;
  contentType: "application/pdf" | "image/jpeg" | "image/png" | null;
  byteSize: number | null;
  createdAt: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

function hasExpectedFileSignature(contentType: string, bytes: Buffer) {
  if (contentType === "application/pdf") return bytes.subarray(0, 5).equals(Buffer.from("%PDF-"));
  if (contentType === "image/jpeg") return bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (contentType === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return false;
}

export async function listSubdivisionDevelopmentAttachments(subjectId: string | undefined, rawContext: unknown, developmentId: string, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionDevelopmentAttachmentSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_draft_development_attachments", {
    p_actor_user_id: actorUserId,
    p_organization_id: context.organizationId,
    p_module: context.module,
    p_purpose_code: context.purposeCode,
    p_development_id: developmentId,
  });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_DEVELOPMENT_ATTACHMENT_READ_DENIED");
  return data.map((row) => ({
    attachmentId: String(row.attachment_id),
    category: String(row.category) as AttachmentCategory,
    state: String(row.attachment_state) as AttachmentState,
    contentType: row.content_type === null ? null : String(row.content_type) as SubdivisionDevelopmentAttachmentSummary["contentType"],
    byteSize: row.byte_size === null ? null : Number(row.byte_size),
    createdAt: String(row.created_at),
  }));
}

export async function createSubdivisionDevelopmentAttachmentIntent(subjectId: string | undefined, rawInput: CreateSubdivisionDevelopmentAttachmentIntentInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ attachmentId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = createSubdivisionDevelopmentAttachmentIntentInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_create_draft_development_attachment_intent", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_category: input.category,
    p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_DEVELOPMENT_ATTACHMENT_COMMAND_DENIED");
  return { attachmentId: data };
}

export async function archiveSubdivisionDevelopmentAttachment(subjectId: string | undefined, rawInput: ArchiveSubdivisionDevelopmentAttachmentInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ attachmentId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = archiveSubdivisionDevelopmentAttachmentInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_archive_draft_development_attachment", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_attachment_id: input.attachmentId,
    p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_DEVELOPMENT_ATTACHMENT_COMMAND_DENIED");
  return { attachmentId: data };
}

export async function storeSubdivisionDevelopmentAttachment(input: { subjectId?: string; organizationId: string; purposeCode: string; attachmentId: string; correlationId: string; contentType: string; bytes: Buffer }, client: RpcClient = getSupabaseAdminClient(), writePrivateObject: PrivateStorageWriter = storagePut): Promise<{ attachmentId: string }> {
  if (!input.subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  if (!allowedTypes.has(input.contentType) || input.bytes.byteLength < 1 || input.bytes.byteLength > maxBytes || !hasExpectedFileSignature(input.contentType, input.bytes)) {
    throw new Error("SUBDIVISION_DEVELOPMENT_ATTACHMENT_UPLOAD_REJECTED");
  }
  const authorization = await client.rpc("subdivision_authorize_development_attachment_upload", {
    p_actor_user_id: input.subjectId,
    p_organization_id: input.organizationId,
    p_module: "loteadora",
    p_purpose_code: input.purposeCode,
    p_attachment_id: input.attachmentId,
  });
  if (authorization.error || typeof authorization.data !== "string") throw new Error("SUBDIVISION_DEVELOPMENT_ATTACHMENT_UPLOAD_DENIED");

  const stored = await writePrivateObject(`private/${input.organizationId}/development-attachments/${input.attachmentId}`, input.bytes, input.contentType);
  const { data, error } = await client.rpc("subdivision_record_development_attachment_upload", {
    p_actor_user_id: input.subjectId,
    p_organization_id: input.organizationId,
    p_module: "loteadora",
    p_purpose_code: input.purposeCode,
    p_attachment_id: input.attachmentId,
    p_storage_key: stored.key,
    p_content_type: input.contentType,
    p_byte_size: input.bytes.byteLength,
    p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") {
    console.warn("[Development attachment upload] Metadata registration denied after private storage write");
    throw new Error("SUBDIVISION_DEVELOPMENT_ATTACHMENT_UPLOAD_DENIED");
  }
  return { attachmentId: data };
}
