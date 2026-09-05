import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AcceptOwnWorkforceAccessInput,
  PrepareWorkforceAccessInput,
  RequestOwnWorkforceAccessInput,
  WorkforceProfile,
} from "../shared/adminCommandContracts";
import { getSupabaseAdminClient } from "./supabase";

type AdminClient = Pick<SupabaseClient, "rpc">;

export type WorkforceAccessState = "requested" | "prepared" | "active" | "expired" | "withdrawn" | "rejected";

export type WorkforceAccessRequest = {
  requestId: string;
  organizationLabel: string;
  profile: WorkforceProfile;
  state: WorkforceAccessState;
};

function commandError(): TRPCError {
  return new TRPCError({ code: "PRECONDITION_FAILED", message: "WORKFORCE_ACCESS_PRECONDITIONS_UNMET" });
}

async function callUuidRpc(functionName: string, parameters: Record<string, unknown>, client: AdminClient): Promise<string> {
  const { data, error } = await client.rpc(functionName, parameters);
  if (error || typeof data !== "string") throw commandError();
  return data;
}

function normalizeRequest(record: unknown): WorkforceAccessRequest | null {
  if (!record || typeof record !== "object") return null;
  const value = record as Record<string, unknown>;
  if (
    typeof value.request_id !== "string"
    || typeof value.organization_label !== "string"
    || (value.workforce_profile !== "collaborator" && value.workforce_profile !== "broker")
    || !["requested", "prepared", "active", "expired", "withdrawn", "rejected"].includes(String(value.request_state))
  ) return null;
  return {
    requestId: value.request_id,
    organizationLabel: value.organization_label,
    profile: value.workforce_profile,
    state: value.request_state as WorkforceAccessState,
  };
}

async function listRequests(functionName: string, subjectId: string | null, client: AdminClient): Promise<WorkforceAccessRequest[]> {
  if (!subjectId) return [];
  const { data, error } = await client.rpc(functionName, { p_actor_user_id: subjectId });
  if (error || !Array.isArray(data)) throw commandError();
  return data.flatMap((item) => {
    const request = normalizeRequest(item);
    return request ? [request] : [];
  });
}

export async function requestOwnWorkforceAccess(
  subjectId: string | null,
  input: RequestOwnWorkforceAccessInput,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<{ requestId: string; state: "requested" }> {
  if (!subjectId) throw commandError();
  const requestId = await callUuidRpc("organization_request_workforce_access", {
    p_actor_user_id: subjectId,
    p_organization_reference: input.organizationReference,
    p_workforce_profile: input.profile,
    p_correlation_id: input.correlationId,
  }, client);
  return { requestId, state: "requested" };
}

export async function listOwnWorkforceAccessRequests(
  subjectId: string | null,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<WorkforceAccessRequest[]> {
  return listRequests("organization_list_own_workforce_access_requests", subjectId, client);
}

export async function listPlatformWorkforceAccessRequests(
  subjectId: string | null,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<WorkforceAccessRequest[]> {
  return listRequests("platform_list_workforce_access_requests", subjectId, client);
}

export async function listOrganizationWorkforceAccessRequests(
  subjectId: string | null,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<WorkforceAccessRequest[]> {
  return listRequests("organization_list_workforce_access_requests", subjectId, client);
}

async function prepareWorkforceAccess(
  functionName: "platform_prepare_workforce_access" | "organization_prepare_workforce_access",
  subjectId: string | null,
  input: PrepareWorkforceAccessInput,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<{ requestId: string; state: "prepared" }> {
  if (!subjectId) throw commandError();
  const requestId = await callUuidRpc(functionName, {
    p_actor_user_id: subjectId,
    p_request_id: input.requestId,
    p_role: input.role,
    p_scope_selector: input.scopeSelector,
    p_purpose_code: input.purposeCode,
    p_expires_at: input.expiresAt,
    p_correlation_id: input.correlationId,
  }, client);
  return { requestId, state: "prepared" };
}

export async function preparePlatformWorkforceAccess(
  subjectId: string | null,
  input: PrepareWorkforceAccessInput,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<{ requestId: string; state: "prepared" }> {
  return prepareWorkforceAccess("platform_prepare_workforce_access", subjectId, input, client);
}

export async function prepareOrganizationWorkforceAccess(
  subjectId: string | null,
  input: PrepareWorkforceAccessInput,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<{ requestId: string; state: "prepared" }> {
  return prepareWorkforceAccess("organization_prepare_workforce_access", subjectId, input, client);
}

export async function acceptOwnWorkforceAccess(
  subjectId: string | null,
  input: AcceptOwnWorkforceAccessInput,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<{ requestId: string; state: "active" }> {
  if (!subjectId) throw commandError();
  const requestId = await callUuidRpc("organization_accept_own_workforce_access", {
    p_actor_user_id: subjectId,
    p_request_id: input.requestId,
    p_correlation_id: input.correlationId,
  }, client);
  return { requestId, state: "active" };
}
