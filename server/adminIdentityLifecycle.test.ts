import { describe, expect, it } from "vitest";
import { deriveAdministrativeIdentityLifecycle } from "../shared/adminIdentityLifecycle";

describe("administrative identity lifecycle", () => {
  it("does not transform session connection into administrative authority", () => {
    expect(deriveAdministrativeIdentityLifecycle({
      hasSupabaseSession: true,
      principalState: "absent",
      mfaVerified: false,
      recoveryRegistered: false,
    })).toMatchObject({ state: "connected", canBootstrap: true, canActivate: false });
  });

  it("requires pending principal, MFA and recovery before controlled activation", () => {
    expect(deriveAdministrativeIdentityLifecycle({
      hasSupabaseSession: true,
      principalState: "pending_activation",
      mfaVerified: false,
      recoveryRegistered: false,
    }).state).toBe("mfa_pending");

    expect(deriveAdministrativeIdentityLifecycle({
      hasSupabaseSession: true,
      principalState: "pending_activation",
      mfaVerified: true,
      recoveryRegistered: false,
    }).state).toBe("recovery_pending");

    expect(deriveAdministrativeIdentityLifecycle({
      hasSupabaseSession: true,
      principalState: "pending_activation",
      mfaVerified: true,
      recoveryRegistered: true,
    })).toMatchObject({ state: "ready_for_activation", canActivate: true });
  });

  it("fails closed for suspended and revoked principals", () => {
    for (const principalState of ["suspended", "revoked"] as const) {
      expect(deriveAdministrativeIdentityLifecycle({
        hasSupabaseSession: true,
        principalState,
        mfaVerified: true,
        recoveryRegistered: true,
      })).toMatchObject({ state: principalState, canBootstrap: false, canActivate: false });
    }
  });
});
