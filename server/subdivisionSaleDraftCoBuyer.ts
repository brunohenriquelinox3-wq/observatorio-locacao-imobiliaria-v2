import type { SupabaseClient } from "@supabase/supabase-js";
import { draftSubdivisionSaleDraftCoBuyerInputSchema, subdivisionContextSchema, type DraftSubdivisionSaleDraftCoBuyerInput } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
export type SubdivisionSaleDraftCoBuyerSummary = { saleDraftCoBuyerId: string; saleDraftId: string; buyerClientId: string; createdAt: string };

function requireSubject(subjectId: string | undefined) {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

export async function addSubdivisionSaleDraftCoBuyer(subjectId: string | undefined, rawInput: DraftSubdivisionSaleDraftCoBuyerInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ saleDraftCoBuyerId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftSubdivisionSaleDraftCoBuyerInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_add_sale_draft_co_buyer", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_sale_draft_id: input.saleDraftId, p_buyer_client_id: input.buyerClientId, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_SALE_DRAFT_CO_BUYER_DENIED");
  return { saleDraftCoBuyerId: data };
}

export async function listSubdivisionSaleDraftCoBuyers(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionSaleDraftCoBuyerSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_sale_draft_co_buyers", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_SALE_DRAFT_CO_BUYER_READ_DENIED");
  return data.map((row) => ({ saleDraftCoBuyerId: String(row.sale_draft_co_buyer_id), saleDraftId: String(row.sale_draft_id), buyerClientId: String(row.buyer_client_id), createdAt: String(row.created_at) }));
}
