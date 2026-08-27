export type AdministrativeIdentityState =
  | "not_connected"
  | "connected"
  | "bootstrap_pending"
  | "mfa_pending"
  | "recovery_pending"
  | "ready_for_activation"
  | "active"
  | "suspended"
  | "revoked";

export type AdministrativeIdentitySnapshot = {
  hasSupabaseSession: boolean;
  principalState: "absent" | "pending_activation" | "active" | "suspended" | "revoked";
  mfaVerified: boolean;
  recoveryRegistered: boolean;
};

export type AdministrativeIdentityLifecycle = {
  state: AdministrativeIdentityState;
  nextRequirement: string;
  canBootstrap: boolean;
  canActivate: boolean;
};

/**
 * A sessão comprova somente a identidade. A alçada segue separada e só se torna
 * ativa após principal pendente, MFA e recuperação registrados.
 */
export function deriveAdministrativeIdentityLifecycle(
  snapshot: AdministrativeIdentitySnapshot,
): AdministrativeIdentityLifecycle {
  if (!snapshot.hasSupabaseSession) {
    return { state: "not_connected", nextRequirement: "Conectar identidade Supabase", canBootstrap: false, canActivate: false };
  }
  if (snapshot.principalState === "absent") {
    return { state: "connected", nextRequirement: "Preparar bootstrap pendente", canBootstrap: true, canActivate: false };
  }
  if (snapshot.principalState === "suspended") {
    return { state: "suspended", nextRequirement: "Revisão por administrador de plataforma", canBootstrap: false, canActivate: false };
  }
  if (snapshot.principalState === "revoked") {
    return { state: "revoked", nextRequirement: "Novo processo de acesso autorizado", canBootstrap: false, canActivate: false };
  }
  if (snapshot.principalState === "active") {
    return { state: "active", nextRequirement: "Manter MFA, recuperação e recertificação vigentes", canBootstrap: false, canActivate: false };
  }
  if (!snapshot.mfaVerified) {
    return { state: "mfa_pending", nextRequirement: "Concluir MFA", canBootstrap: false, canActivate: false };
  }
  if (!snapshot.recoveryRegistered) {
    return { state: "recovery_pending", nextRequirement: "Registrar recuperação", canBootstrap: false, canActivate: false };
  }
  return { state: "ready_for_activation", nextRequirement: "Ativação controlada por política", canBootstrap: false, canActivate: true };
}
