import { TRPCError } from "@trpc/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  GrantMembershipInput,
  ProvisionOrganizationInput,
  RevokeMembershipInput,
  SuspendMembershipInput,
} from "../shared/adminCommandContracts";
import { getSupabaseAdminClient } from "./supabase";

type AdminClient = Pick<SupabaseClient, "from" | "rpc">;

export type AdministrativeSubjectStatus = {
  identityState: "not_connected" | "principal_absent" | "pending_activation" | "active" | "suspended" | "revoked";
  mfaVerified: boolean;
  bootstrapAction: "unavailable" | "available" | "completed";
  commandMode: "blocked" | "bootstrap_pending" | "ready_for_controlled_commands";
};

function configurationError(): TRPCError {
  return new TRPCError({ code: "PRECONDITION_FAILED", message: "ADMIN_COMMAND_PRECONDITIONS_UNMET" });
}

async function callUuidRpc(
  functionName: string,
  parameters: Record<string, unknown>,
  client: AdminClient,
): Promise<string> {
  const { data, error } = await client.rpc(functionName, parameters);
  if (error || typeof data !== "string") throw configurationError();
  return data;
}

export async function getAdministrativeSubjectStatus(
  subjectId: string | null,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<AdministrativeSubjectStatus> {
  if (!subjectId) {
    return { identityState: "not_connected", mfaVerified: false, bootstrapAction: "unavailable", commandMode: "blocked" };
  }

  const { data, error } = await client
    .from("platform_principals")
    .select("state,mfa_verified_at")
    .eq("user_id", subjectId)
    .maybeSingle();
  if (error) throw configurationError();

  if (!data) {
    return { identityState: "principal_absent", mfaVerified: false, bootstrapAction: "available", commandMode: "bootstrap_pending" };
  }

  const identityState = data.state as Exclude<AdministrativeSubjectStatus["identityState"], "not_connected" | "principal_absent">;
  const mfaVerified = Boolean(data.mfa_verified_at);
  const active = identityState === "active" && mfaVerified;
  return {
    identityState,
    mfaVerified,
    bootstrapAction: identityState === "pending_activation" ? "completed" : "unavailable",
    commandMode: active ? "ready_for_controlled_commands" : "blocked",
  };
}

export async function bootstrapCurrentSubject(
  subjectId: string | null,
  correlationId: string,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<{ principalId: string; state: "pending_activation" }> {
  if (!subjectId) throw configurationError();
  const status = await getAdministrativeSubjectStatus(subjectId, client);
  if (status.bootstrapAction !== "available") throw configurationError();

  const principalId = await callUuidRpc(
    "platform_bootstrap_principal",
    { p_subject_id: subjectId, p_correlation_id: correlationId },
    client,
  );
  return { principalId, state: "pending_activation" };
}

async function requireActivePlatformPrincipal(subjectId: string | null, client: AdminClient): Promise<string> {
  if (!subjectId) throw configurationError();
  const status = await getAdministrativeSubjectStatus(subjectId, client);
  if (status.commandMode !== "ready_for_controlled_commands") throw configurationError();
  return subjectId;
}

export async function provisionOrganization(
  subjectId: string | null,
  input: ProvisionOrganizationInput,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<{ organizationId: string; state: "draft" }> {
  const actorId = await requireActivePlatformPrincipal(subjectId, client);
  const organizationId = await callUuidRpc(
    "platform_provision_organization",
    { p_actor_user_id: actorId, p_name: input.name, p_domain: input.domain ?? null, p_correlation_id: input.correlationId },
    client,
  );
  return { organizationId, state: "draft" };
}

export async function delegateMembership(
  subjectId: string | null,
  input: GrantMembershipInput,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<{ membershipId: string; state: "invited" }> {
  const actorId = await requireActivePlatformPrincipal(subjectId, client);
  const membershipId = await callUuidRpc(
    "platform_delegate_membership",
    {
      p_actor_user_id: actorId,
      p_organization_id: input.organizationId,
      p_subject_id: input.subjectId,
      p_role: input.role,
      p_scope_selector: input.scopeSelector,
      p_purpose_code: input.purposeCode,
      p_expires_at: input.expiresAt ?? null,
      p_correlation_id: input.correlationId,
    },
    client,
  );
  return { membershipId, state: "invited" };
}

export async function suspendMembership(
  subjectId: string | null,
  input: SuspendMembershipInput,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<{ membershipId: string; state: "suspended" }> {
  const actorId = await requireActivePlatformPrincipal(subjectId, client);
  const membershipId = await callUuidRpc(
    "platform_suspend_membership",
    { p_actor_user_id: actorId, p_membership_id: input.membershipId, p_reason_code: input.reasonCode, p_correlation_id: input.correlationId },
    client,
  );
  return { membershipId, state: "suspended" };
}

export async function revokeMembership(
  subjectId: string | null,
  input: RevokeMembershipInput,
  client: AdminClient = getSupabaseAdminClient(),
): Promise<{ membershipId: string; state: "revoked" }> {
  const actorId = await requireActivePlatformPrincipal(subjectId, client);
  const membershipId = await callUuidRpc(
    "platform_revoke_membership",
    { p_actor_user_id: actorId, p_membership_id: input.membershipId, p_reason_code: input.reasonCode, p_correlation_id: input.correlationId },
    client,
  );
  return { membershipId, state: "revoked" };
}
