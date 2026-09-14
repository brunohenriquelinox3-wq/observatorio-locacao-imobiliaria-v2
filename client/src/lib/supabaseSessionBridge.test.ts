import { afterEach, describe, expect, it, vi } from "vitest";
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
  afterEach(() => {
    vi.useRealTimers();
  });

  it("waits for the initial session before returning the access token", async () => {
    const source = sessionSource({ access_token: "initial-token" });
    const bridge = createSupabaseSessionBridge(source);

    await bridge.ready();
    await expect(bridge.getAccessToken()).resolves.toBe("initial-token");
  });

  it("does not release the first request before a delayed session is restored", async () => {
    let resolveInitial: (value: { data: { session: SupabaseAccessTokenSession } }) => void = () => undefined;
    const initialSession = new Promise<{ data: { session: SupabaseAccessTokenSession } }>((resolve) => {
      resolveInitial = resolve;
    });
    const source = sessionSource(null);
    source.auth.getSession.mockReturnValueOnce(initialSession);
    const bridge = createSupabaseSessionBridge(source);

    let settled = false;
    const tokenPromise = bridge.getAccessToken().then((token) => {
      settled = true;
      return token;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    resolveInitial({ data: { session: { access_token: "restored-token" } } });
    await expect(tokenPromise).resolves.toBe("restored-token");
  });

  it("replaces the access token after the authentication client refreshes the session", async () => {
    const source = sessionSource({ access_token: "old-token" });
    const onSessionChange = vi.fn();
    const bridge = createSupabaseSessionBridge(source, onSessionChange);
    await bridge.ready();
    onSessionChange.mockClear();

    source.emit("TOKEN_REFRESHED", { access_token: "new-token" });
    await expect(bridge.getAccessToken()).resolves.toBe("new-token");
    expect(onSessionChange).toHaveBeenCalledOnce();
  });

  it("notifies consumers when the delayed initial session supplies the first token", async () => {
    let resolveInitial: (value: { data: { session: SupabaseAccessTokenSession } }) => void = () => undefined;
    const initialSession = new Promise<{ data: { session: SupabaseAccessTokenSession } }>((resolve) => {
      resolveInitial = resolve;
    });
    const source = sessionSource(null);
    source.auth.getSession.mockReturnValueOnce(initialSession);
    const onSessionChange = vi.fn();
    const bridge = createSupabaseSessionBridge(source, onSessionChange);

    source.replaceSession({ access_token: "restored-aal2-token" });
    resolveInitial({ data: { session: { access_token: "restored-aal2-token" } } });

    await bridge.ready();
    await expect(bridge.getAccessToken()).resolves.toBe("restored-aal2-token");
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
    vi.useFakeTimers();
    const source = sessionSource({ access_token: "stale-aal1-token" });
    const bridge = createSupabaseSessionBridge(source);
    await bridge.ready();

    source.replaceSession({ access_token: "fresh-aal2-totp-token" });
    await vi.advanceTimersByTimeAsync(3_001);

    await expect(bridge.getAccessToken()).resolves.toBe("fresh-aal2-totp-token");
  });

  it("shares one session read between concurrent protected requests", async () => {
    vi.useFakeTimers();
    const source = sessionSource({ access_token: "active-aal2-token" });
    const bridge = createSupabaseSessionBridge(source);
    await bridge.ready();
    source.auth.getSession.mockClear();
    await vi.advanceTimersByTimeAsync(3_001);

    await expect(Promise.all([
      bridge.getAccessToken(),
      bridge.getAccessToken(),
      bridge.getAccessToken(),
    ])).resolves.toEqual(["active-aal2-token", "active-aal2-token", "active-aal2-token"]);
    expect(source.auth.getSession).toHaveBeenCalledTimes(1);
  });

  it("fails closed without a Supabase session source", async () => {
    const bridge = createSupabaseSessionBridge(null);
    await expect(bridge.getAccessToken()).resolves.toBeNull();
  });
});
