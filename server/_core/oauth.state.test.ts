import { describe, expect, it } from "vitest";
import { encodeOAuthState, OAUTH_STATE_COOKIE } from "@shared/const";
import { hasMatchingOAuthState } from "./oauth";

describe("state do callback OAuth", () => {
  it("aceita state com nonce correspondente ao cookie de origem", () => {
    const state = encodeOAuthState({ redirectUri: "https://example.test", nonce: "synthetic-nonce" });
    expect(hasMatchingOAuthState(state, `${OAUTH_STATE_COOKIE}=synthetic-nonce`)).toBe(true);
  });

  it("nega state ausente, malformado ou divergente", () => {
    const state = encodeOAuthState({ redirectUri: "https://example.test", nonce: "synthetic-nonce" });
    expect(hasMatchingOAuthState(state, `${OAUTH_STATE_COOKIE}=other-nonce`)).toBe(false);
    expect(hasMatchingOAuthState("not-a-valid-state", `${OAUTH_STATE_COOKIE}=synthetic-nonce`)).toBe(false);
  });
});
