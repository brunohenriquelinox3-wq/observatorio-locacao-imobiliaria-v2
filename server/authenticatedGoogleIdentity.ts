import { z } from "zod";
import { getSupabaseAdminClient } from "./supabase";

const subjectIdSchema = z.string().uuid();

/**
 * Converte uma sessão Supabase já validada pelo contexto em sujeito canônico
 * interno. O RPC não concede alçada, e uma identidade suspensa ou revogada não
 * é reativada por este fluxo.
 */
export async function ensureAuthenticatedGoogleIdentity(subjectId: string) {
  const parsedSubjectId = subjectIdSchema.parse(subjectId);
  const { error } = await getSupabaseAdminClient().rpc("ensure_authenticated_identity_subject", {
    p_actor_user_id: parsedSubjectId,
  });

  if (error) {
    throw new Error("AUTHENTICATED_IDENTITY_BOOTSTRAP_FAILED");
  }
}
