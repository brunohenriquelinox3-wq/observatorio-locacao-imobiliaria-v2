import { getSupabaseAdminClient } from "./supabase";
import {
  archiveSubdivisionPriceEvidenceLinkInputSchema,
  linkSubdivisionPriceEvidenceInputSchema,
  listSubdivisionPriceEvidenceSummaryInputSchema,
  type ArchiveSubdivisionPriceEvidenceLinkInput,
  type LinkSubdivisionPriceEvidenceInput,
  type ListSubdivisionPriceEvidenceSummaryInput,
} from "../shared/subdivisionPriceEvidenceContracts";

type RpcClient = Pick<ReturnType<typeof getSupabaseAdminClient>, "rpc">;

export type SubdivisionPriceEvidenceSummary = {
  subjectKind: "price_base_policy" | "price_condition";
  subjectId: string;
  evidenceCount: number;
};

function requireSubject(subjectId: string | undefined) {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

export async function listSubdivisionPriceEvidenceSummary(
  subjectId: string | undefined,
  rawInput: ListSubdivisionPriceEvidenceSummaryInput,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<SubdivisionPriceEvidenceSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const input = listSubdivisionPriceEvidenceSummaryInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_list_price_evidence_summary_v1", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
  });
  if (error || !Array.isArray(data)) throw new Error("PRICE_EVIDENCE_READ_DENIED");
  return data.map((row) => ({
    subjectKind: String(row.subject_kind) as SubdivisionPriceEvidenceSummary["subjectKind"],
    subjectId: String(row.subject_id),
    evidenceCount: Number(row.evidence_count),
  }));
}

export async function linkSubdivisionPriceEvidence(
  subjectId: string | undefined,
  rawInput: LinkSubdivisionPriceEvidenceInput,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<{ evidenceLinkId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = linkSubdivisionPriceEvidenceInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_link_price_evidence_v1", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_attachment_id: input.attachmentId,
    p_subject_kind: input.subjectKind,
    p_subject_id: input.subjectId,
    p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("PRICE_EVIDENCE_COMMAND_DENIED");
  return { evidenceLinkId: data };
}

export async function archiveSubdivisionPriceEvidenceLink(
  subjectId: string | undefined,
  rawInput: ArchiveSubdivisionPriceEvidenceLinkInput,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<{ evidenceLinkId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = archiveSubdivisionPriceEvidenceLinkInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_archive_price_evidence_link_v1", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId,
    p_evidence_link_id: input.evidenceLinkId,
    p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("PRICE_EVIDENCE_COMMAND_DENIED");
  return { evidenceLinkId: data };
}
