export type MfaSecurityStatus = "checking" | "unavailable" | "enrollment_required" | "challenge_required" | "verified" | "error";

export type MfaSecuritySnapshot = {
  hasSession: boolean;
  currentLevel?: string | null;
  nextLevel?: string | null;
  totpFactorCount: number;
};

export function resolveMfaSecurityStatus(snapshot: MfaSecuritySnapshot): MfaSecurityStatus {
  if (!snapshot.hasSession) return "unavailable";
  if (snapshot.currentLevel === "aal2") return "verified";
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
