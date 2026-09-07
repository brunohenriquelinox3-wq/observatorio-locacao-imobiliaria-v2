export type SupabaseAccessTokenSession = { access_token: string } | null;

export type SupabaseSessionSource = {
  auth: {
    getSession(): Promise<{ data: { session: SupabaseAccessTokenSession } }>;
    onAuthStateChange(callback: (event: string, session: SupabaseAccessTokenSession) => void): unknown;
  };
};

const TOKEN_REFRESH_INTERVAL_MS = 3_000;

function tokenFrom(session: SupabaseAccessTokenSession): string | null {
  return typeof session?.access_token === "string" && session.access_token.length > 0
    ? session.access_token
    : null;
}

export function createSupabaseSessionBridge(source: SupabaseSessionSource | null, onSessionChange?: () => void) {
  let accessToken: string | null = null;
  let sessionRevision = 0;
  let pendingTokenRead: Promise<string | null> | null = null;
  let lastTokenReadAt = 0;
  const initialRevision = sessionRevision;
  let initialSessionSettled = !source;
  const initialSession = source
    ? source.auth.getSession()
      .then(({ data }) => {
        // Uma renovação ou step-up TOTP pode ocorrer antes da leitura inicial
        // terminar. Nesse caso, a sessão mais nova é a única que pode prevalecer.
        if (sessionRevision === initialRevision) {
          const nextToken = tokenFrom(data.session);
          const tokenChanged = accessToken !== nextToken;
          accessToken = nextToken;
          lastTokenReadAt = Date.now();
          // A UI pode ter sido montada pela sessão Manus antes de o token do
          // Supabase chegar. Revalida apenas quando a sessão efetivamente muda,
          // para recuperar contexto sem reinicializar consultas a cada ação.
          if (tokenChanged) onSessionChange?.();
        }
      })
      .catch(() => undefined)
      .finally(() => {
        initialSessionSettled = true;
      })
    : Promise.resolve();
  const boundedInitialSession = Promise.race([
    initialSession,
    // Uma janela curta liberava as chamadas protegidas antes da restauração da
    // sessão. Dez segundos mantém o comportamento fail-closed sem prender a
    // interface indefinidamente se o provedor estiver indisponível.
    new Promise<void>((resolve) => globalThis.setTimeout(resolve, 10_000)),
  ]);

  source?.auth.onAuthStateChange((_event, session) => {
    sessionRevision += 1;
    const nextToken = tokenFrom(session);
    const tokenChanged = accessToken !== nextToken;
    accessToken = nextToken;
    lastTokenReadAt = Date.now();
    // Eventos repetidos do provedor não devem desmontar a área protegida. Só uma
    // troca efetiva de token pode exigir que leituras contextuais sejam refeitas.
    if (tokenChanged) onSessionChange?.();
  });

  return {
    ready: () => boundedInitialSession,
    async getAccessToken(): Promise<string | null> {
      if (!source || !initialSessionSettled) return accessToken;
      if (pendingTokenRead) return pendingTokenRead;
      if (Date.now() - lastTokenReadAt < TOKEN_REFRESH_INTERVAL_MS) return accessToken;

      const revisionBeforeRead = sessionRevision;
      pendingTokenRead = source.auth.getSession()
        .then(({ data }) => {
          // Uma leitura eventual não pode sobrescrever logout, renovação ou
          // step-up que tenham chegado por evento durante a consulta.
          if (sessionRevision === revisionBeforeRead) {
            accessToken = tokenFrom(data.session);
            lastTokenReadAt = Date.now();
          }
          return accessToken;
        })
        .catch(() => null)
        .finally(() => {
          pendingTokenRead = null;
        });

      return pendingTokenRead;
    },
  };
}
