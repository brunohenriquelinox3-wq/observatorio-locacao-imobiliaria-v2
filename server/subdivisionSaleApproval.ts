import type { SupabaseClient } from "@supabase/supabase-js";
import { approveSubdivisionSaleCaseInputSchema, requestSubdivisionSaleReversalInputSchema, type ApproveSubdivisionSaleCaseInput, type RequestSubdivisionSaleReversalInput } from "../shared/subdivisionSaleCaseContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
const requireSubject = (subjectId: string | undefined) => { if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED"); return subjectId; };
export type SubdivisionSaleApprovalResult = { saleCaseId: string; lotCommercialState: "sold" | "reversal_review"; contractState: "approved" };

function parseResult(data: unknown): SubdivisionSaleApprovalResult {
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("SUBDIVISION_SALE_APPROVAL_DENIED");
  const value = data as Record<string, unknown>;
  if (typeof value.sale_case_id !== "string" || (value.lot_commercial_state !== "sold" && value.lot_commercial_state !== "reversal_review") || value.contract_state !== "approved") throw new Error("SUBDIVISION_SALE_APPROVAL_DENIED");
  return { saleCaseId: value.sale_case_id, lotCommercialState: value.lot_commercial_state, contractState: "approved" };
}

export async function approveSubdivisionSaleCase(subjectId: string | undefined, rawInput: ApproveSubdivisionSaleCaseInput, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionSaleApprovalResult> {
  const actorUserId = requireSubject(subjectId); const input = approveSubdivisionSaleCaseInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_approve_sale_case", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_sale_case_id: input.saleCaseId, p_correlation_id: input.correlationId });
  if (error) throw new Error("SUBDIVISION_SALE_APPROVAL_DENIED"); return parseResult(data);
}

export async function requestSubdivisionSaleReversal(subjectId: string | undefined, rawInput: RequestSubdivisionSaleReversalInput, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionSaleApprovalResult> {
  const actorUserId = requireSubject(subjectId); const input = requestSubdivisionSaleReversalInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_request_sale_reversal", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_sale_case_id: input.saleCaseId, p_correlation_id: input.correlationId });
  if (error) throw new Error("SUBDIVISION_SALE_REVERSAL_DENIED"); return parseResult(data);
}
