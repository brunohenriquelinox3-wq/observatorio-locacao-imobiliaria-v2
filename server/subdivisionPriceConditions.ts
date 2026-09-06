import type { SupabaseClient } from "@supabase/supabase-js";
import {
  approveSubdivisionPriceConditionInputSchema,
  createSubdivisionPriceConditionInputSchema,
  getSubdivisionLotPriceContextInputSchema,
  listSubdivisionPriceConditionsInputSchema,
  submitSubdivisionPriceConditionInputSchema,
  withdrawSubdivisionPriceConditionInputSchema,
  type ApproveSubdivisionPriceConditionInput,
  type CreateSubdivisionPriceConditionInput,
  type GetSubdivisionLotPriceContextInput,
  type ListSubdivisionPriceConditionsInput,
  type SubmitSubdivisionPriceConditionInput,
  type WithdrawSubdivisionPriceConditionInput,
} from "../shared/subdivisionPriceConditionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type ConditionState = "prepared" | "submitted" | "approved" | "expired" | "withdrawn";
type ConditionScope = "development" | "block" | "lot";
type ConditionKind = "override_per_sqm" | "percentage_adjustment" | "temporary_discount";
type DocumentState = "pending_evidence" | "under_review" | "declared_complete" | "review_required";
type LotPriceAvailabilityReason = "no_policy" | "prepared_with_exceptions" | "prepared_pending_validation" | "submitted_pending_approval" | "approved_outside_vigency" | "policy_not_available";

export type PriceConditionSummary = {
  conditionId: string;
  developmentId: string;
  basePolicyId: string;
  conditionReference: string;
  scope: ConditionScope;
  adjustmentKind: ConditionKind;
  effectiveFrom: string;
  effectiveUntil: string | null;
  reasonCode: string;
  documentState: DocumentState;
  state: ConditionState;
  createdAt: string;
  submittedAt: string | null;
  approvedAt: string | null;
};

export type LotPriceContext = {
  state: "unavailable" | "active";
  availabilityReason: LotPriceAvailabilityReason | null;
  policyReference: string | null;
  conditionReference: string | null;
  conditionScope: ConditionScope | null;
  conditionKind: ConditionKind | null;
  effectiveFrom: string | null;
  effectiveUntil: string | null;
  documentState: DocumentState | null;
  effectivePricePerSqmBrl: number | null;
  lotAreaSqm: number | null;
  effectiveLotTotalBrl: number | null;
};

function requireSubject(subjectId: string | undefined) {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

function requireObject(data: unknown, failure: string) {
  if (!data || typeof data !== "object") throw new Error(failure);
  return data as Record<string, unknown>;
}

export async function createSubdivisionPriceCondition(subjectId: string | undefined, rawInput: CreateSubdivisionPriceConditionInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ conditionId: string; state: "prepared" }> {
  const actorUserId = requireSubject(subjectId);
  const input = createSubdivisionPriceConditionInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_create_price_condition_v2", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_development_id: input.developmentId, p_base_policy_id: input.basePolicyId, p_condition_reference: input.conditionReference,
    p_scope: input.scope, p_block_id: input.blockId, p_lot_number: input.lotNumber, p_adjustment_kind: input.adjustmentKind,
    p_amount: input.amount, p_effective_from: input.effectiveFrom, p_effective_until: input.effectiveUntil,
    p_reason_code: input.reasonCode, p_document_state: input.documentState, p_correlation_id: input.correlationId,
  });
  if (error || typeof data !== "string") throw new Error("PRICE_CONDITION_CREATE_DENIED");
  return { conditionId: data, state: "prepared" };
}

export async function listSubdivisionPriceConditions(subjectId: string | undefined, rawInput: ListSubdivisionPriceConditionsInput, client: RpcClient = getSupabaseAdminClient()): Promise<PriceConditionSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const input = listSubdivisionPriceConditionsInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_list_price_conditions_v1", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_development_id: input.developmentId });
  if (error || !Array.isArray(data)) throw new Error("PRICE_CONDITION_LIST_DENIED");
  return data.map((row) => ({
    conditionId: String(row.condition_id), developmentId: String(row.development_id), basePolicyId: String(row.base_policy_id), conditionReference: String(row.condition_reference), scope: String(row.scope) as ConditionScope, adjustmentKind: String(row.adjustment_kind) as ConditionKind,
    effectiveFrom: String(row.effective_from), effectiveUntil: row.effective_until ? String(row.effective_until) : null, reasonCode: String(row.reason_code), documentState: String(row.document_state) as DocumentState, state: String(row.condition_state) as ConditionState,
    createdAt: String(row.created_at), submittedAt: row.submitted_at ? String(row.submitted_at) : null, approvedAt: row.approved_at ? String(row.approved_at) : null,
  }));
}

export async function getSubdivisionLotPriceContext(subjectId: string | undefined, rawInput: GetSubdivisionLotPriceContextInput, client: RpcClient = getSupabaseAdminClient()): Promise<LotPriceContext> {
  const actorUserId = requireSubject(subjectId);
  const input = getSubdivisionLotPriceContextInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_get_lot_price_context_v4", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_development_id: input.developmentId, p_block_id: input.blockId, p_lot_number: input.lotNumber });
  if (error) throw new Error("LOT_PRICE_CONTEXT_DENIED");
  const result = requireObject(data, "LOT_PRICE_CONTEXT_DENIED");
  const state = String(result.state);
  if (state !== "unavailable" && state !== "active") throw new Error("LOT_PRICE_CONTEXT_DENIED");
  const availabilityReason = result.availability_reason ? String(result.availability_reason) as LotPriceAvailabilityReason : null;
  if (availabilityReason && !["no_policy", "prepared_with_exceptions", "prepared_pending_validation", "submitted_pending_approval", "approved_outside_vigency", "policy_not_available"].includes(availabilityReason)) throw new Error("LOT_PRICE_CONTEXT_DENIED");
  return {
    state,
    availabilityReason,
    policyReference: result.policy_reference ? String(result.policy_reference) : null,
    conditionReference: result.condition_reference ? String(result.condition_reference) : null,
    conditionScope: result.condition_scope ? String(result.condition_scope) as ConditionScope : null,
    conditionKind: result.condition_kind ? String(result.condition_kind) as ConditionKind : null,
    effectiveFrom: result.effective_from ? String(result.effective_from) : null,
    effectiveUntil: result.effective_until ? String(result.effective_until) : null,
    documentState: result.document_state ? String(result.document_state) as DocumentState : null,
    effectivePricePerSqmBrl: typeof result.effective_price_per_sqm_brl === "number" ? result.effective_price_per_sqm_brl : null,
    lotAreaSqm: state === "active" && typeof result.lot_area_sqm === "number" && result.lot_area_sqm > 0 ? result.lot_area_sqm : null,
    effectiveLotTotalBrl: state === "active" && typeof result.effective_lot_total_brl === "number" && result.effective_lot_total_brl > 0 ? result.effective_lot_total_brl : null,
  };
}

async function transitionPriceCondition(subjectId: string | undefined, rawInput: SubmitSubdivisionPriceConditionInput | ApproveSubdivisionPriceConditionInput | WithdrawSubdivisionPriceConditionInput, operation: "submit" | "approve" | "withdraw", client: RpcClient = getSupabaseAdminClient()) {
  const actorUserId = requireSubject(subjectId);
  const schema = operation === "submit" ? submitSubdivisionPriceConditionInputSchema : operation === "approve" ? approveSubdivisionPriceConditionInputSchema : withdrawSubdivisionPriceConditionInputSchema;
  const input = schema.parse(rawInput);
  const rpcName = operation === "submit" ? "subdivision_submit_price_condition_v2" : operation === "approve" ? "subdivision_approve_price_condition_v2" : "subdivision_withdraw_price_condition_v2";
  const rpcInput = { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_condition_id: input.conditionId, p_correlation_id: input.correlationId } as Record<string, unknown>;
  if (operation === "withdraw") rpcInput.p_reason_code = (input as WithdrawSubdivisionPriceConditionInput).reasonCode;
  const { data, error } = await client.rpc(rpcName, rpcInput);
  if (error?.message === "PRICE_CONDITION_EVIDENCE_REQUIRED") throw new Error("PRICE_CONDITION_EVIDENCE_REQUIRED");
  if (error || typeof data !== "string") throw new Error(`PRICE_CONDITION_${operation.toUpperCase()}_DENIED`);
  return { conditionId: data };
}

export const submitSubdivisionPriceCondition = (subjectId: string | undefined, input: SubmitSubdivisionPriceConditionInput, client?: RpcClient) => transitionPriceCondition(subjectId, input, "submit", client);
export const approveSubdivisionPriceCondition = (subjectId: string | undefined, input: ApproveSubdivisionPriceConditionInput, client?: RpcClient) => transitionPriceCondition(subjectId, input, "approve", client);
export const withdrawSubdivisionPriceCondition = (subjectId: string | undefined, input: WithdrawSubdivisionPriceConditionInput, client?: RpcClient) => transitionPriceCondition(subjectId, input, "withdraw", client);
