import { describe, expect, it } from "vitest";
import { activationPathForInvite, isSupabaseInviteFragment } from "./supabaseInvitationActivation";

describe("Supabase invitation activation", () => {
  it("moves only an invitation fragment to the isolated activation route", () => {
    const fragment = "#access_token=test-token&type=invite&expires_in=3600";
    expect(isSupabaseInviteFragment(fragment)).toBe(true);
    expect(activationPathForInvite(fragment)).toBe(`/ativar-conta${fragment}`);
  });

  it("does not redirect a non-invitation fragment", () => {
    expect(activationPathForInvite("#access_token=test-token&type=recovery")).toBeNull();
  });
});
