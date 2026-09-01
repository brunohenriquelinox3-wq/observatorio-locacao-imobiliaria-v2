export type SupabaseAccessTokenSession = { access_token: string } | null;

export type SupabaseSessionSource = {
  auth: {
    getSession(): Promise<{ data: { session: SupabaseAccessTokenSession } }>;
    onAuthStateChange(callback: (event: string, session: SupabaseAccessTokenSession) => void): unknown;
  };
};

function tokenFrom(session: SupabaseAccessTokenSession): string | null {
  return typeof session?.access_token === "string" && session.access_token.length > 0
    ? session.access_token
    : null;
}

export function createSupabaseSessionBridge(source: SupabaseSessionSource | null, onSessionChange?: () => void) {
  let accessToken: string | null = null;
  let sessionRevision = 0;
  const initialRevision = sessionRevision;
  let initialSessionSettled = !source;
  const initialSession = source
    ? source.auth.getSession()
      .then(({ data }) => {
        // Uma renovação ou step-up TOTP pode ocorrer antes da leitura inicial
        // terminar. Nesse caso, a sessão mais nova é a única que pode prevalecer.
        if (sessionRevision === initialRevision) accessToken = tokenFrom(data.session);
      })
      .catch(() => undefined)
      .finally(() => {
        initialSessionSettled = true;
      })
    : Promise.resolve();
  const boundedInitialSession = Promise.race([
    initialSession,
    new Promise<void>((resolve) => globalThis.setTimeout(resolve, 1_500)),
  ]);

  source?.auth.onAuthStateChange((_event, session) => {
    sessionRevision += 1;
    accessToken = tokenFrom(session);
    onSessionChange?.();
  });

  return {
    ready: () => initialSession,
    async getAccessToken(): Promise<string | null> {
      await boundedInitialSession;
      if (accessToken) return accessToken;
      // Não inicia uma segunda leitura concorrente: ela pode manter o lote tRPC
      // suspenso. As procedures continuam falhando fechadas sem o cabeçalho.
      return initialSessionSettled ? accessToken : null;
    },
  };
}
