import type { SupabaseClient } from "@supabase/supabase-js";
import {
  domainContextSchema,
  draftPartyInputSchema,
  draftPartyRoleInputSchema,
  type DomainContext,
  type DraftPartyInput,
  type DraftPartyRoleInput,
} from "../shared/domainFoundationContracts";
import { getSupabaseAdminClient } from "./supabase";

type RpcClient = Pick<SupabaseClient, "rpc">;

export type DraftPartySummary = {
  partyId: string;
  kind: "individual" | "legal_entity";
  displayName: string;
  sourceKind: "operator_declaration" | "import_preview";
  roleCount: number;
};

export type DraftPartyRoleSummary = {
  partyRoleAssignmentId: string;
  partyId: string;
  displayName: string;
  role: string;
  startsAt: string;
  endsAt: string | null;
};

function requireSubject(subjectId: string | undefined): string {
  if (!subjectId) throw new Error("DOMAIN_IDENTITY_REQUIRED");
  return subjectId;
}

async function invokeUuidRpc(client: RpcClient, functionName: string, parameters: Record<string, unknown>): Promise<string> {
  const { data, error } = await client.rpc(functionName, parameters);
  if (error || typeof data !== "string") throw new Error("DOMAIN_COMMAND_DENIED");
  return data;
}

export async function listDraftParties(
  subjectId: string | undefined,
  rawContext: DomainContext,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<DraftPartySummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = domainContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("domain_list_draft_parties", {
    p_actor_user_id: actorUserId,
    p_organization_id: context.organizationId,
    p_module: context.module,
    p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("DOMAIN_READ_DENIED");

  return data.map((row) => ({
    partyId: String(row.party_id),
    kind: row.kind === "legal_entity" ? "legal_entity" : "individual",
    displayName: String(row.display_name),
    sourceKind: row.source_kind === "import_preview" ? "import_preview" : "operator_declaration",
    roleCount: Number(row.role_count ?? 0),
  }));
}

export async function listDraftPartyRoles(
  subjectId: string | undefined,
  rawContext: DomainContext,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<DraftPartyRoleSummary[]> {
  const actorUserId = requireSubject(subjectId);
  const context = domainContextSchema.parse(rawContext);
  const { data, error } = await client.rpc("domain_list_draft_party_roles", {
    p_actor_user_id: actorUserId,
    p_organization_id: context.organizationId,
    p_module: context.module,
    p_purpose_code: context.purposeCode,
  });
  if (error || !Array.isArray(data)) throw new Error("DOMAIN_ROLE_READ_DENIED");

  return data.map((row) => ({
    partyRoleAssignmentId: String(row.party_role_assignment_id),
    partyId: String(row.party_id),
    displayName: String(row.display_name),
    role: String(row.role),
    startsAt: String(row.starts_at),
    endsAt: row.ends_at ? String(row.ends_at) : null,
  }));
}

export async function createDraftParty(
  subjectId: string | undefined,
  rawInput: DraftPartyInput,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<{ partyId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftPartyInputSchema.parse(rawInput);
  const partyId = await invokeUuidRpc(client, "domain_create_draft_party", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_kind: input.kind,
    p_display_name: input.displayName,
    p_source_kind: input.sourceKind,
    p_correlation_id: input.correlationId,
  });
  return { partyId };
}

export async function assignDraftPartyRole(
  subjectId: string | undefined,
  rawInput: DraftPartyRoleInput,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<{ partyRoleId: string }> {
  const actorUserId = requireSubject(subjectId);
  const input = draftPartyRoleInputSchema.parse(rawInput);
  const partyRoleId = await invokeUuidRpc(client, "domain_assign_draft_party_role", {
    p_actor_user_id: actorUserId,
    p_organization_id: input.organizationId,
    p_party_id: input.partyId,
    p_module: input.module,
    p_purpose_code: input.purposeCode,
    p_role: input.role,
    p_starts_at: input.beginsAt ?? null,
    p_ends_at: input.endsAt ?? null,
    p_correlation_id: input.correlationId,
  });
  return { partyRoleId };
}
