import type { SupabaseClient } from "@supabase/supabase-js";
import {
  addSubdivisionSaleCaseJointProponentInputSchema,
  lookupSubdivisionBuyerClientByFiscalReferenceInputSchema,
  openSubdivisionSaleCaseInputSchema,
  removeSubdivisionSaleCaseJointProponentInputSchema,
  saveSubdivisionSaleCaseTermsInputSchema,
  type AddSubdivisionSaleCaseJointProponentInput,
  type LookupSubdivisionBuyerClientByFiscalReferenceInput,
  type OpenSubdivisionSaleCaseInput,
  type RemoveSubdivisionSaleCaseJointProponentInput,
  type SaveSubdivisionSaleCaseTermsInput,
} from "../shared/subdivisionSaleCaseContracts";
import { subdivisionContextSchema } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
const saleCaseStates = ["preparation", "terms_review", "awaiting_approval", "approved", "cancelled", "archived"] as const;
type SaleCaseState = (typeof saleCaseStates)[number];

export type SubdivisionSaleCaseLookup = { buyerClientId: string; displayName: string; partyKind: string; profileRegistrationState: string };
export type SubdivisionSaleCaseSummary = { saleCaseId: string; lotId: string; buyerClientId: string; state: SaleCaseState; termsVersion: number | null; negotiatedTotalCents: number | null; entryAmountCents: number | null; entryDueDate: string | null; installmentCount: number; installmentAmountCents: number | null; firstDueDate: string | null; dueDay: number | null; createdAt: string; updatedAt: string };
export type SubdivisionSaleCasePartySummary = { saleCaseId: string; buyerClientId: string; partyRole: "primary_proponent" | "joint_proponent" };

function requireSubject(subjectId: string | undefined) {
  if (!subjectId) throw new Error("SUBDIVISION_IDENTITY_REQUIRED");
  return subjectId;
}

function numericOrNull(value: unknown) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) throw new Error("SUBDIVISION_SALE_CASE_READ_DENIED");
  return parsed;
}

export async function lookupSubdivisionBuyerClientByFiscalReference(subjectId: string | undefined, rawInput: LookupSubdivisionBuyerClientByFiscalReferenceInput, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionSaleCaseLookup | null> {
  const actorUserId = requireSubject(subjectId);
  const input = lookupSubdivisionBuyerClientByFiscalReferenceInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_lookup_buyer_client_by_fiscal_reference", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_document_reference: input.documentReference, p_correlation_id: input.correlationId });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_SALE_CASE_LOOKUP_DENIED");
  if (data.length === 0) return null;
  const row = data[0];
  if (!row || typeof row.buyer_client_id !== "string" || typeof row.display_name !== "string") throw new Error("SUBDIVISION_SALE_CASE_LOOKUP_DENIED");
  return { buyerClientId: row.buyer_client_id, displayName: row.display_name, partyKind: String(row.party_kind), profileRegistrationState: String(row.profile_registration_state) };
}

export async function openSubdivisionSaleCase(subjectId: string | undefined, rawInput: OpenSubdivisionSaleCaseInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ saleCaseId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = openSubdivisionSaleCaseInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_open_sale_case", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_lot_id: input.lotId, p_buyer_client_id: input.buyerClientId, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_SALE_CASE_OPEN_DENIED");
  return { saleCaseId: data };
}

export async function addSubdivisionSaleCaseJointProponent(subjectId: string | undefined, rawInput: AddSubdivisionSaleCaseJointProponentInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ saleCasePartyId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = addSubdivisionSaleCaseJointProponentInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_add_sale_case_joint_proponent", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_sale_case_id: input.saleCaseId, p_buyer_client_id: input.buyerClientId, p_correlation_id: input.correlationId });
  if (error || typeof data !== "string") throw new Error("SUBDIVISION_SALE_CASE_PARTY_DENIED");
  return { saleCasePartyId: data };
}

export async function removeSubdivisionSaleCaseJointProponent(subjectId: string | undefined, rawInput: RemoveSubdivisionSaleCaseJointProponentInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ saleCaseId: string; jointProponentRemoved: true }> {
  const actorUserId = requireSubject(subjectId);
  const input = removeSubdivisionSaleCaseJointProponentInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_remove_sale_case_joint_proponent", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_sale_case_id: input.saleCaseId, p_buyer_client_id: input.buyerClientId, p_correlation_id: input.correlationId });
  if (error || !data || typeof data !== "object" || (data as Record<string, unknown>).sale_case_id !== input.saleCaseId || (data as Record<string, unknown>).joint_proponent_removed !== true) throw new Error("SUBDIVISION_SALE_CASE_PARTY_DENIED");
  return { saleCaseId: input.saleCaseId, jointProponentRemoved: true };
}

export async function listSubdivisionSaleCaseParties(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionSaleCasePartySummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_sale_case_parties", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_SALE_CASE_PARTY_READ_DENIED");
  return data.map((row) => {
    const partyRole = String(row.party_role);
    if (typeof row.sale_case_id !== "string" || typeof row.buyer_client_id !== "string" || !["primary_proponent", "joint_proponent"].includes(partyRole)) throw new Error("SUBDIVISION_SALE_CASE_PARTY_READ_DENIED");
    return { saleCaseId: row.sale_case_id, buyerClientId: row.buyer_client_id, partyRole: partyRole as SubdivisionSaleCasePartySummary["partyRole"] };
  });
}

export async function saveSubdivisionSaleCaseTerms(subjectId: string | undefined, rawInput: SaveSubdivisionSaleCaseTermsInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ saleCaseId: string; termsVersion: number; state: "preparation" }> {
  const actorUserId = requireSubject(subjectId);
  const input = saveSubdivisionSaleCaseTermsInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_save_sale_case_terms", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_sale_case_id: input.saleCaseId, p_negotiated_total_cents: input.negotiatedTotalCents, p_entry_amount_cents: input.entryAmountCents, p_entry_due_date: input.entryDueDate, p_installment_count: input.installmentCount, p_installment_amount_cents: input.installmentAmountCents, p_first_due_date: input.firstDueDate, p_due_day: input.dueDay, p_correlation_id: input.correlationId });
  if (error || !data || typeof data !== "object" || typeof (data as Record<string, unknown>).sale_case_id !== "string" || !Number.isInteger(Number((data as Record<string, unknown>).terms_version)) || (data as Record<string, unknown>).state !== "preparation") throw new Error("SUBDIVISION_SALE_CASE_TERMS_DENIED");
  return { saleCaseId: String((data as Record<string, unknown>).sale_case_id), termsVersion: Number((data as Record<string, unknown>).terms_version), state: "preparation" };
}

export async function listSubdivisionSaleCases(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<SubdivisionSaleCaseSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = subdivisionContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("subdivision_list_sale_cases", { p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode });
  if (error || !Array.isArray(data)) throw new Error("SUBDIVISION_SALE_CASE_READ_DENIED");
  return data.map((row) => {
    const state = String(row.state);
    if (typeof row.sale_case_id !== "string" || typeof row.lot_id !== "string" || typeof row.buyer_client_id !== "string" || !saleCaseStates.includes(state as SaleCaseState)) throw new Error("SUBDIVISION_SALE_CASE_READ_DENIED");
    return { saleCaseId: row.sale_case_id, lotId: row.lot_id, buyerClientId: row.buyer_client_id, state: state as SaleCaseState, termsVersion: numericOrNull(row.terms_version), negotiatedTotalCents: numericOrNull(row.negotiated_total_cents), entryAmountCents: numericOrNull(row.entry_amount_cents), entryDueDate: row.entry_due_date == null ? null : String(row.entry_due_date), installmentCount: Number(row.installment_count), installmentAmountCents: numericOrNull(row.installment_amount_cents), firstDueDate: row.first_due_date === null ? null : String(row.first_due_date), dueDay: numericOrNull(row.due_day), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
  });
}
