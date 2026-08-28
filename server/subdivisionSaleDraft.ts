import type { SupabaseClient } from "@supabase/supabase-js";
import { draftSubdivisionSaleDraftInputSchema, subdivisionContextSchema, type DraftSubdivisionSaleDraftInput } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
export type SubdivisionSaleDraftSummary = { saleDraftId: string; lotId: string; buyerClientId: string; createdAt: string };

function requireSubject(subjectId: string | undefined) {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

export async function createSubdivisionSaleDraft(subjectId: string | undefined, rawInput: DraftSubdivisionSaleDraftInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ saleDraftId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftSubdivisionSaleDraftInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_create_sale_draft", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_lot_id: input.lotId, p_buyer_client_id: input.buyerClientId, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_SALE_DRAFT_DENIED");
  return { saleDraftId: data };
}

export async function listSubdivisionSaleDrafts(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionSaleDraftSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_sale_drafts", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_SALE_DRAFT_READ_DENIED");
  return data.map((row) => ({ saleDraftId: String(row.sale_draft_id), lotId: String(row.lot_id), buyerClientId: String(row.buyer_client_id), createdAt: String(row.created_at) }));
}
