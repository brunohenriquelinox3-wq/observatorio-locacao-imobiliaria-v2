import { describe, expect, it } from "vitest";
import { activationPathForPasswordFlow, supabasePasswordFlowFromFragment } from "./supabaseInvitationActivation";

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
});
