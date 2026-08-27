import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "./supabase";

type SupabaseAuthClient = Pick<SupabaseClient, "auth">;

/**
 * Resolve somente o UUID de um token Supabase transportado em header próprio.
 * Falhas e tokens ausentes são tratados como identidade indisponível; detalhes
 * do provedor nunca atravessam a fronteira de contexto.
 */
export async function resolveSupabaseSubjectId(
  accessToken: string | undefined,
  client: SupabaseAuthClient = getSupabaseAdminClient(),
): Promise<string | null> {
  if (!accessToken || accessToken.length > 8_192) return null;

  try {
    const { data, error } = await client.auth.getUser(accessToken);
    if (error || !data.user?.id) return null;
    return data.user.id;
  } catch {
    return null;
  }
}
