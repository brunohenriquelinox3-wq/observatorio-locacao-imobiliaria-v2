import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "./supabase";

type SupabaseAuthClient = Pick<SupabaseClient, "auth">;

export type SupabaseMfaAttestation = {
  subjectId: string;
  assuranceLevel: "aal2";
  method: "totp";
  verifiedRecoveryChannel: boolean;
  verifiedAt: string;
};

type JwtAmrEntry = { method?: unknown; timestamp?: unknown };

function readJwtPayload(accessToken: string): Record<string, unknown> | null {
  const encodedPayload = accessToken.split(".")[1];
  if (!encodedPayload || encodedPayload.length > 6_000) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

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

/**
 * O `getUser` valida o token contra o Supabase antes de o servidor interpretar
 * as claims AAL/AMR. A atestação é válida enquanto o token de sessão AAL2
 * permanecer válido; logout, expiração ou revogação voltam a falhar fechados.
 */
export async function attestSupabaseMfa(
  accessToken: string | undefined,
  client: SupabaseAuthClient = getSupabaseAdminClient(),
  now = new Date(),
): Promise<SupabaseMfaAttestation | null> {
  if (!accessToken || accessToken.length > 8_192) return null;
  const payload = readJwtPayload(accessToken);
  if (!payload || payload.aal !== "aal2" || typeof payload.sub !== "string" || !Array.isArray(payload.amr)) return null;

  const mostRecentMethod = payload.amr
    .map((entry) => entry as JwtAmrEntry)
    .filter((entry) => entry.method === "totp" && typeof entry.timestamp === "number")
    .reduce<JwtAmrEntry | undefined>((latest, entry) => !latest || Number(entry.timestamp) > Number(latest.timestamp) ? entry : latest, undefined);
  const timestamp = typeof mostRecentMethod?.timestamp === "number" ? mostRecentMethod.timestamp : NaN;
  const verifiedAt = new Date(timestamp * 1_000);
  if (mostRecentMethod?.method !== "totp" || !Number.isFinite(verifiedAt.getTime()) || verifiedAt.getTime() > now.getTime() + 60_000) return null;

  try {
    const { data, error } = await client.auth.getUser(accessToken);
    const user = data.user;
    if (error || !user?.id || user.id !== payload.sub || !user.email_confirmed_at) return null;
    return {
      subjectId: user.id,
      assuranceLevel: "aal2",
      method: "totp",
      verifiedRecoveryChannel: true,
      verifiedAt: verifiedAt.toISOString(),
    };
  } catch {
    return null;
  }
}
