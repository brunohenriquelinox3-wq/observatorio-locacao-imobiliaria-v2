import type { SupabaseClient } from "@supabase/supabase-js";
import { formalizeSubdivisionSaleCaseInputSchema, type FormalizeSubdivisionSaleCaseInput } from "../shared/subdivisionSaleCaseContracts";
import { subdivisionContextSchema } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
const requireSubject = (subjectId: string | undefined) => { if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED"); return subjectId; };

export type InternalSaleContractSummary = { contractPreparationId: string; saleCaseId: string; state: "internal_review" | "approved" | "archived"; termsVersion: number; scheduledItemCount: number; scheduledTotalCents: number; bankIssuanceState: "awaiting_bank_issue"; createdAt: string; updatedAt: string };

export async function formalizeSubdivisionSaleCase(subjectId: string | undefined, rawInput: FormalizeSubdivisionSaleCaseInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ contractPreparationId: string; saleCaseId: string; scheduledItemCount: number; bankIssuanceState: "awaiting_bank_issue" }> {
  const actorUserId = requireSubject(subjectId); const input = formalizeSubdivisionSaleCaseInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_formalize_sale_case", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_sale_case_id: input.saleCaseId, p_correlation_id: input.correlationId });
  if (error || !data || typeof data !== "object" || Array.isArray(data)) throw new Error("SUBDIVISION_SALE_FORMALIZATION_DENIED");
  const result = data as Record<string, unknown>;
  if (typeof result.contract_preparation_id !== "string" || typeof result.sale_case_id !== "string" || typeof result.scheduled_item_count !== "number" || result.bank_issuance_state !== "awaiting_bank_issue") throw new Error("SUBDIVISION_SALE_FORMALIZATION_DENIED");
  return { contractPreparationId: result.contract_preparation_id, saleCaseId: result.sale_case_id, scheduledItemCount: result.scheduled_item_count, bankIssuanceState: "awaiting_bank_issue" };
}

export async function listSubdivisionInternalSaleContracts(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<InternalSaleContractSummary[]> {
  const actorUserId = requireSubject(subjectId); const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_internal_sale_contracts", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_SALE_FORMALIZATION_READ_DENIED");
  return data.map((item) => { const row = item as Record<string, unknown>; const state = String(row.contract_state); if (!(["internal_review", "approved", "archived"] as const).includes(state as InternalSaleContractSummary["state"])) throw new Error("SUBDIVISION_SALE_FORMALIZATION_READ_DENIED"); if (row.bank_issuance_state !== "awaiting_bank_issue") throw new Error("SUBDIVISION_SALE_FORMALIZATION_READ_DENIED"); return { contractPreparationId: String(row.contract_preparation_id), saleCaseId: String(row.sale_case_id), state: state as InternalSaleContractSummary["state"], termsVersion: Number(row.terms_version), scheduledItemCount: Number(row.scheduled_item_count), scheduledTotalCents: Number(row.scheduled_total_cents), bankIssuanceState: "awaiting_bank_issue", createdAt: String(row.created_at), updatedAt: String(row.updated_at) }; });
}
