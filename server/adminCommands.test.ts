import { describe, expect, it, vi } from "vitest";
import { activatePendingPlatformPrincipal, bootstrapCurrentSubject, getAdministrativeSubjectStatus } from "./adminCommands";

const subjectId = "550e8400-e29b-41d4-a716-446655440000";
const correlationId = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function clientWithPrincipal(data: unknown) {
  const query = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.maybeSingle.mockResolvedValue({ data, error: null });
  return { from: vi.fn().mockReturnValue(query), rpc: vi.fn() } as never;
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
});
