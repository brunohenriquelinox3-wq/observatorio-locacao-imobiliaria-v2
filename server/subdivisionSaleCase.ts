import type { SupabaseClient } from "@supabase/supabase-js";
import {
  lookupSubdivisionBuyerClientByFiscalReferenceInputSchema,
  openSubdivisionSaleCaseInputSchema,
  saveSubdivisionSaleCaseTermsInputSchema,
  type LookupSubdivisionBuyerClientByFiscalReferenceInput,
  type OpenSubdivisionSaleCaseInput,
  type SaveSubdivisionSaleCaseTermsInput,
} from "../shared/subdivisionSaleCaseContracts";
import { subdivisionContextSchema } from "../shared/subdivisionContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
const saleCaseStates = ["preparation", "terms_review", "awaiting_approval", "approved", "cancelled", "archived"] as const;
type SaleCaseState = (typeof saleCaseStates)[number];

export type SubdivisionSaleCaseLookup = { buyerClientId: string; displayName: string; partyKind: string; profileRegistrationState: string };
export type SubdivisionSaleCaseSummary = { saleCaseId: string; lotId: string; buyerClientId: string; state: SaleCaseState; termsVersion: number | null; negotiatedTotalCents: number | null; entryAmountCents: number | null; installmentCount: number; installmentAmountCents: number | null; firstDueDate: string | null; dueDay: number | null; createdAt: string; updatedAt: string };

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

export async function saveSubdivisionSaleCaseTerms(subjectId: string | undefined, rawInput: SaveSubdivisionSaleCaseTermsInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ saleCaseId: string; termsVersion: number; state: "preparation" }> {
  const actorUserId = requireSubject(subjectId);
  const input = saveSubdivisionSaleCaseTermsInputSchema.parse(rawInput);
  const { data, error } = await client.rpc("subdivision_save_sale_case_terms", { p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode, p_sale_case_id: input.saleCaseId, p_negotiated_total_cents: input.negotiatedTotalCents, p_entry_amount_cents: input.entryAmountCents, p_installment_count: input.installmentCount, p_installment_amount_cents: input.installmentAmountCents, p_first_due_date: input.firstDueDate, p_due_day: input.dueDay, p_correlation_id: input.correlationId });
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
    return { saleCaseId: row.sale_case_id, lotId: row.lot_id, buyerClientId: row.buyer_client_id, state: state as SaleCaseState, termsVersion: numericOrNull(row.terms_version), negotiatedTotalCents: numericOrNull(row.negotiated_total_cents), entryAmountCents: numericOrNull(row.entry_amount_cents), installmentCount: Number(row.installment_count), installmentAmountCents: numericOrNull(row.installment_amount_cents), firstDueDate: row.first_due_date === null ? null : String(row.first_due_date), dueDay: numericOrNull(row.due_day), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
  });
}
