import { clearLegacyAuthIdentityMirror } from "@/lib/authIdentityStorage";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/**
 * A sessão operacional é a identidade Supabase validada no servidor a cada
 * chamada. O provedor Google somente a estabelece; o vínculo interno segue
 * responsável por conceder organização, módulo, escopo e alçada.
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();
  const [authLoadingTimedOut, setAuthLoadingTimedOut] = useState(false);

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 60_000,
    placeholderData: (previousUser) => previousUser,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  useEffect(() => {
    if (!meQuery.isLoading) {
      setAuthLoadingTimedOut(false);
      return;
    }

    const timeoutId = window.setTimeout(() => setAuthLoadingTimedOut(true), 12_000);
    return () => window.clearTimeout(timeoutId);
  }, [meQuery.isLoading]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    clearLegacyAuthIdentityMirror(window.localStorage);
  }, []);

  const logout = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        const { error } = await supabase.auth.signOut({ scope: "local" });
        if (error) throw error;
      }
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED") {
        return;
      }
      throw error;
    } finally {
      // Limpa somente vestígios locais. Sem token Supabase, toda rota protegida
      // volta a falhar fechada no servidor.
      try {
        sessionStorage.removeItem("manus-cookie");
      } catch {}
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils]);

  const state = useMemo(() => ({
    user: meQuery.data ?? null,
    loading: (meQuery.isLoading && !authLoadingTimedOut) || logoutMutation.isPending,
    error: meQuery.error ?? logoutMutation.error ?? null,
    isAuthenticated: Boolean(meQuery.data),
  }), [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    authLoadingTimedOut,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending || state.user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    if (redirectPath) {
      window.location.href = redirectPath;
      return;
    }

    const currentPath = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/entrar?proximo=${encodeURIComponent(currentPath)}`;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
