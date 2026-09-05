import { describe, expect, it, vi } from "vitest";
import { createSupabaseSessionBridge, type SupabaseAccessTokenSession } from "./supabaseSessionBridge";

function sessionSource(initialSession: SupabaseAccessTokenSession) {
  let callback: ((event: string, session: SupabaseAccessTokenSession) => void) | undefined;
  let currentSession = initialSession;
  return {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: currentSession } })),
      onAuthStateChange: vi.fn().mockImplementation((listener) => {
        callback = listener;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
    },
    emit(event: string, session: SupabaseAccessTokenSession) {
      currentSession = session;
      callback?.(event, session);
    },
    replaceSession(session: SupabaseAccessTokenSession) {
      currentSession = session;
    },
  };
}

describe("Supabase session bridge", () => {
  it("waits for the initial session before returning the access token", async () => {
    const source = sessionSource({ access_token: "initial-token" });
    const bridge = createSupabaseSessionBridge(source);

    await bridge.ready();
    await expect(bridge.getAccessToken()).resolves.toBe("initial-token");
  });

  it("replaces the access token after the authentication client refreshes the session", async () => {
    const source = sessionSource({ access_token: "old-token" });
    const onSessionChange = vi.fn();
    const bridge = createSupabaseSessionBridge(source, onSessionChange);
    await bridge.ready();

    source.emit("TOKEN_REFRESHED", { access_token: "new-token" });
    await expect(bridge.getAccessToken()).resolves.toBe("new-token");
    expect(onSessionChange).toHaveBeenCalledOnce();
  });

  it("does not replace a stepped-up session with a late initial read", async () => {
    let resolveInitial: (value: { data: { session: SupabaseAccessTokenSession } }) => void = () => undefined;
    const initialSession = new Promise<{ data: { session: SupabaseAccessTokenSession } }>((resolve) => {
      resolveInitial = resolve;
    });
    const source = sessionSource({ access_token: "ignored-initial-token" });
    source.auth.getSession.mockReturnValueOnce(initialSession);
    const bridge = createSupabaseSessionBridge(source);

    source.emit("MFA_CHALLENGE_VERIFIED", { access_token: "aal2-totp-token" });
    resolveInitial({ data: { session: { access_token: "stale-aal1-token" } } });

    await bridge.ready();
    await expect(bridge.getAccessToken()).resolves.toBe("aal2-totp-token");
  });

  it("reads the fresh AAL2 session even when the client does not emit an MFA event", async () => {
    const source = sessionSource({ access_token: "stale-aal1-token" });
    const bridge = createSupabaseSessionBridge(source);
    await bridge.ready();

    source.replaceSession({ access_token: "fresh-aal2-totp-token" });

    await expect(bridge.getAccessToken()).resolves.toBe("fresh-aal2-totp-token");
  });

  it("fails closed without a Supabase session source", async () => {
    const bridge = createSupabaseSessionBridge(null);
    await expect(bridge.getAccessToken()).resolves.toBeNull();
  });
});
