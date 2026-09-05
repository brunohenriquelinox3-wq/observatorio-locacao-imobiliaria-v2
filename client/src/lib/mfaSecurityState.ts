export type MfaSecurityStatus = "checking" | "unavailable" | "enrollment_required" | "challenge_required" | "verified" | "error";

export type MfaSecuritySnapshot = {
  hasSession: boolean;
  currentLevel?: string | null;
  nextLevel?: string | null;
  totpFactorCount: number;
  hasRecentTotp?: boolean;
};

const TOTP_RECENCY_MS = 15 * 60_000;

type JwtAmrEntry = { method?: unknown; timestamp?: unknown };

function readJwtPayload(accessToken: string): Record<string, unknown> | null {
  const encodedPayload = accessToken.split(".")[1];
  if (!encodedPayload || encodedPayload.length > 6_000) return null;
  try {
    const base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
    const decoded = globalThis.atob(base64);
    const payload = JSON.parse(decoded);
    return payload && typeof payload === "object" && !Array.isArray(payload) ? payload as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

/** Mantém a indicação visual no mesmo limite de recência que o servidor. */
export function hasRecentTotpMfa(accessToken: string | null | undefined, nowMs = Date.now()): boolean {
  if (!accessToken || accessToken.length > 8_192) return false;
  const payload = readJwtPayload(accessToken);
  if (!payload || payload.aal !== "aal2" || !Array.isArray(payload.amr)) return false;
  const latestTotp = payload.amr
    .map((entry) => entry as JwtAmrEntry)
    .filter((entry) => entry.method === "totp" && typeof entry.timestamp === "number")
    .reduce<JwtAmrEntry | undefined>((latest, entry) => !latest || Number(entry.timestamp) > Number(latest.timestamp) ? entry : latest, undefined);
  const timestamp = typeof latestTotp?.timestamp === "number" ? latestTotp.timestamp * 1_000 : Number.NaN;
  const ageMs = nowMs - timestamp;
  return Number.isFinite(timestamp) && ageMs >= -60_000 && ageMs <= TOTP_RECENCY_MS;
}

export function resolveMfaSecurityStatus(snapshot: MfaSecuritySnapshot): MfaSecurityStatus {
  if (!snapshot.hasSession) return "unavailable";
  if (snapshot.currentLevel === "aal2" && snapshot.hasRecentTotp === true) return "verified";
  if (snapshot.totpFactorCount > 0 || snapshot.nextLevel === "aal2") return "challenge_required";
  return "enrollment_required";
}

export function mfaSecurityStatusCopy(status: MfaSecurityStatus): { label: string; description: string } {
  switch (status) {
    case "verified":
      return { label: "MFA recente reconhecido", description: "A sessão alcançou o nível reforçado. Cada comando continuará sendo revalidado pelo servidor." };
    case "challenge_required":
      return { label: "Revalidação necessária", description: "Abra o autenticador e confirme um novo código para elevar esta sessão." };
    case "enrollment_required":
      return { label: "Proteção ainda não configurada", description: "Configure um autenticador TOTP antes de comandos sensíveis." };
    case "unavailable":
      return { label: "Sessão de contexto indisponível", description: "Entre no contexto autorizado antes de configurar ou validar o MFA." };
    case "error":
      return { label: "Estado de segurança não confirmado", description: "Não foi possível confirmar o estado do MFA. Os comandos continuam bloqueados." };
    case "checking":
      return { label: "Verificando proteção", description: "O estado da sessão está sendo conferido com o provedor de identidade." };
  }
}
