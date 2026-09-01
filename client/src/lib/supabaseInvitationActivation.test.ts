import { describe, expect, it } from "vitest";
import { activationPathForPasswordFlow, passwordFlowForActivation, recoveryStateAfterAssurance, supabasePasswordFlowFromFragment } from "./supabaseInvitationActivation";

describe("Supabase password-flow activation", () => {
  it("moves an invitation fragment to the isolated activation route", () => {
    const fragment = "#access_token=test-token&type=invite&expires_in=3600";
    expect(supabasePasswordFlowFromFragment(fragment)).toBe("invite");
    expect(activationPathForPasswordFlow(fragment)).toBe(`/ativar-conta${fragment}`);
  });

  it("moves a recovery fragment to the same isolated route", () => {
    const fragment = "#access_token=test-token&type=recovery";
    expect(supabasePasswordFlowFromFragment(fragment)).toBe("recovery");
    expect(activationPathForPasswordFlow(fragment)).toBe(`/ativar-conta${fragment}`);
  });

  it("does not redirect a non-password session fragment", () => {
    expect(activationPathForPasswordFlow("#access_token=test-token&type=magiclink")).toBeNull();
  });

  it("retains only the non-secret recovery flow after the URL is cleaned", () => {
    expect(passwordFlowForActivation("", "recovery")).toBe("recovery");
    expect(passwordFlowForActivation("", "magiclink")).toBeNull();
  });

  it("requires a verified TOTP factor before a recovery session at AAL1 can update a password", () => {
    expect(recoveryStateAfterAssurance("recovery", "aal1", true)).toBe("mfa_required");
    expect(recoveryStateAfterAssurance("recovery", "aal1", false)).toBe("missing");
    expect(recoveryStateAfterAssurance("recovery", "aal2", true)).toBe("ready");
  });
});
