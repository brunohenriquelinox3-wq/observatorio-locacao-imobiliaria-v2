import { describe, expect, it, vi } from "vitest";
import { activateOrganization, activatePendingPlatformPrincipal, activateSelfOrganizationAdmin, bootstrapCurrentSubject, getAdministrativeSubjectStatus, listActivatableOrganizations, listSelfAdministrationOrganizationTargets } from "./adminCommands";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const correlationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const organizationId = "7ba7b810-9dad-11d1-80b4-00c04fd430c8";

function clientWithPrincipal(data: unknown, subjectData: unknown = { lifecycle_state: "active" }) {
  const makeQuery = (result: unknown) => {
    const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    query.maybeSingle.mockResolvedValue({ data: result, error: null });
    return query;
  };
  const principalQuery = makeQuery(data);
  const subjectQuery = makeQuery(subjectData);
  return {
    from: vi.fn().mockImplementation((table: string) => table === "platform_principals" ? principalQuery : subjectQuery),
    rpc: vi.fn(),
  } as never;
}

describe("admin command service", () => {
  it("offers bootstrap only to a connected subject without a principal", async () => {
    const client = clientWithPrincipal(null);
    await expect(getAdministrativeSubjectStatus(subjectId, client)).resolves.toMatchObject({
      identityState: "principal_absent",
      bootstrapAction: "available",
      commandMode: "bootstrap_pending",
    });
  });

  it("creates only a pending principal through the controlled RPC", async () => {
    const client = clientWithPrincipal(null);
    client.rpc.mockResolvedValue({ data: subjectId, error: null });

    await expect(bootstrapCurrentSubject(subjectId, correlationId, client)).resolves.toEqual({
      principalId: subjectId,
      state: "pending_activation",
    });
    expect(client.rpc).toHaveBeenCalledWith("platform_bootstrap_principal", {
      p_subject_id: subjectId,
      p_correlation_id: correlationId,
    });
  });

  it("keeps privileged commands blocked while activation and MFA are incomplete", async () => {
    const client = clientWithPrincipal({ state: "pending_activation", mfa_verified_at: null });
    await expect(getAdministrativeSubjectStatus(subjectId, client)).resolves.toMatchObject({
      bootstrapAction: "completed",
      commandMode: "blocked",
      mfaVerified: false,
    });
  });

  it("returns only the active caller platform role needed to project the Super Admin state", async () => {
    const client = clientWithPrincipal({
      state: "active",
      role: "platform_super_admin",
      mfa_verified_at: "2026-08-28T00:00:00.000Z",
    });

    await expect(getAdministrativeSubjectStatus(subjectId, client)).resolves.toEqual({
      identityState: "active",
      mfaVerified: true,
      bootstrapAction: "unavailable",
      commandMode: "ready_for_controlled_commands",
      platformRole: "platform_super_admin",
    });
    expect(client.from).toHaveBeenCalledWith("platform_principals");
    expect(client.from).toHaveBeenCalledWith("identity_subjects");
    expect(client.from.mock.results[0]?.value.select).toHaveBeenCalledWith("state,role,mfa_verified_at");
    expect(client.from.mock.results[1]?.value.select).toHaveBeenCalledWith("lifecycle_state");
  });

  it("keeps commands blocked when the subject lifecycle is not active", async () => {
    const client = clientWithPrincipal({
      state: "active",
      role: "platform_super_admin",
      mfa_verified_at: "2026-08-28T00:00:00.000Z",
    }, { lifecycle_state: "pending_activation" });

    await expect(getAdministrativeSubjectStatus(subjectId, client)).resolves.toMatchObject({
      identityState: "active",
      mfaVerified: true,
      commandMode: "blocked",
    });
  });

  it("activates only a pending principal with server-attested MFA and verified recovery", async () => {
    const client = clientWithPrincipal({ state: "pending_activation", mfa_verified_at: null });
    client.rpc.mockResolvedValue({ data: subjectId, error: null });
    const result = await activatePendingPlatformPrincipal({
      subjectId,
      assuranceLevel: "aal2",
      method: "totp",
      verifiedRecoveryChannel: true,
      verifiedAt: "2026-08-27T23:19:50.000Z",
    }, correlationId, client);

    expect(result).toEqual({ principalId: subjectId, state: "active" });
    expect(client.rpc).toHaveBeenCalledWith("platform_attest_and_activate_principal", expect.objectContaining({
      p_subject_id: subjectId,
      p_aal: "aal2",
      p_amr_method: "totp",
      p_verified_recovery_channel: true,
    }));
  });

  it("rejects activation when the server does not have a complete attestation", async () => {
    const client = clientWithPrincipal({ state: "pending_activation", mfa_verified_at: null });
    await expect(activatePendingPlatformPrincipal(null, correlationId, client)).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("activates a self-admin membership only through the dedicated actor-bound RPC", async () => {
    const client = clientWithPrincipal({ state: "active", role: "platform_super_admin", mfa_verified_at: "2026-09-01T16:00:00.000Z" });
    client.rpc.mockResolvedValue({ data: organizationId, error: null });

    await expect(activateSelfOrganizationAdmin(subjectId, { organizationId, correlationId }, client)).resolves.toEqual({
      membershipId: organizationId,
      state: "active",
      moduleCount: 3,
    });
    expect(client.rpc).toHaveBeenCalledWith("platform_activate_self_organization_admin", {
      p_actor_user_id: subjectId,
      p_organization_id: organizationId,
      p_correlation_id: correlationId,
    });
  });

  it("returns only eligible organization labels to the current SUPER ADM", async () => {
    const client = clientWithPrincipal({ state: "active", role: "platform_super_admin", mfa_verified_at: "2026-09-01T16:00:00.000Z" });
    client.rpc.mockResolvedValue({ data: [{ organization_id: organizationId, organization_label: "Organização sintética", organization_state: "draft" }], error: null });

    await expect(listSelfAdministrationOrganizationTargets(subjectId, client)).resolves.toEqual([{
      organizationId,
      organizationLabel: "Organização sintética",
      organizationState: "draft",
    }]);
    expect(client.rpc).toHaveBeenCalledWith("platform_list_self_admin_organizations", { p_actor_user_id: subjectId });
  });

  it("lists only draft organizations with the caller's active ADM membership for activation", async () => {
    const client = clientWithPrincipal({ state: "active", role: "platform_super_admin", mfa_verified_at: "2026-09-01T16:00:00.000Z" });
    client.rpc.mockResolvedValue({ data: [{ organization_id: organizationId, organization_label: "Organização sintética", organization_state: "draft" }], error: null });

    await expect(listActivatableOrganizations(subjectId, client)).resolves.toEqual([{
      organizationId,
      organizationLabel: "Organização sintética",
      organizationState: "draft",
    }]);
    expect(client.rpc).toHaveBeenCalledWith("platform_list_activatable_organizations", { p_actor_user_id: subjectId });
  });

  it("activates an eligible organization only through the dedicated actor-bound RPC", async () => {
    const client = clientWithPrincipal({ state: "active", role: "platform_super_admin", mfa_verified_at: "2026-09-01T16:00:00.000Z" });
    client.rpc.mockResolvedValue({ data: organizationId, error: null });

    await expect(activateOrganization(subjectId, { organizationId, correlationId }, client)).resolves.toEqual({ organizationId, state: "active" });
    expect(client.rpc).toHaveBeenCalledWith("platform_activate_organization", {
      p_actor_user_id: subjectId,
      p_organization_id: organizationId,
      p_correlation_id: correlationId,
    });
  });
});
