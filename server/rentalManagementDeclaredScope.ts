import type { SupabaseClient } from "@supabase/supabase-js";
import {
  draftRentalManagementScopeInputSchema,
  rentalOperatingContextSchema,
  type DraftRentalManagementScopeInput,
} from "../shared/rentalPipelineContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;
type ManagementScope = "full_administration_interest" | "tenant_search_interest" | "undecided";

export type DraftRentalManagementDeclaredScopeSummary = {
  scopeId: string;
  intakeId: string;
  declaredScope: ManagementScope;
  internalNotePresent: boolean;
  updatedAt: string;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("RENTAL_IDENTITY_REQUIRED");
  return subjectId;
}

async function invokeUuidRpc(client: RpcClient, functionName: string, parameters: Record<string, unknown>): Promise<string> {
  const { data, error } = await client.rpc(functionName, parameters);
  if (error || typeof data !== "string") throw new Error("RENTAL_MANAGEMENT_SCOPE_COMMAND_DENIED");
  return data;
}

const managementScopes: ManagementScope[] = ["full_administration_interest", "tenant_search_interest", "undecided"];

export async function listDraftRentalManagementDeclaredScopes(subjectId: string | undefined, rawContext: unknown, client: RpcClient = getSupabaseAdminClient()): Promise<DraftRentalManagementDeclaredScopeSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = rentalOperatingContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("rental_list_draft_management_declared_scopes", {
    p_actor_user_id: actorUserId, p_organization_id: context.organizationId, p_module: context.module, p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("RENTAL_MANAGEMENT_SCOPE_READ_DENIED");
  return data.map((row) => ({
    scopeId: String(row.scope_id),
    intakeId: String(row.intake_id),
    declaredScope: managementScopes.includes(String(row.declared_scope) as ManagementScope)
      ? String(row.declared_scope) as ManagementScope : "undecided",
    internalNotePresent: row.internal_note_present === true,
    updatedAt: String(row.updated_at),
  }));
}

export async function upsertDraftRentalManagementDeclaredScope(subjectId: string | undefined, rawInput: DraftRentalManagementScopeInput, client: RpcClient = getSupabaseAdminClient()): Promise<{ scopeId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftRentalManagementScopeInputSchema.parse(rawInput);
  return { scopeId: await invokeUuidRpc(client, "rental_upsert_draft_management_declared_scope", {
    p_actor_user_id: actorUserId, p_organization_id: input.organizationId, p_module: input.module, p_purpose_code: input.purposeCode,
    p_intake_id: input.intakeId, p_declared_scope: input.declaredScope, p_internal_note_code: input.internalNoteCode,
    p_correlation_id: input.correlationId,
  }) };
}
