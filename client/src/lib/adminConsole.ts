export type AdministrativeConsoleGate = {
  identityState?: "not_connected" | "principal_absent" | "pending_activation" | "active" | "suspended" | "revoked";
  mfaVerified?: boolean;
  commandMode?: "blocked" | "bootstrap_pending" | "ready_for_controlled_commands";
};

export type AdministrativeConsoleState = {
  isCommandFormAvailable: boolean;
  title: string;
  description: string;
};

/** O formulário pode aparecer como explicação, mas só aceita envio depois da alçada server-side. */
export function deriveAdministrativeConsoleState(gate: AdministrativeConsoleGate | undefined): AdministrativeConsoleState {
  if (!gate || gate.identityState === "not_connected") {
    return { isCommandFormAvailable: false, title: "Conecte a identidade", description: "A sessão Supabase é o primeiro gate; ela não concede autoridade." };
  }
  if (gate.identityState === "principal_absent" || gate.commandMode === "bootstrap_pending") {
    return { isCommandFormAvailable: false, title: "Prepare o bootstrap", description: "O principal inicial deve ficar pendente antes de qualquer organização ou membership." };
  }
  if (!gate.mfaVerified) {
    return { isCommandFormAvailable: false, title: "Conclua MFA", description: "A identidade precisa elevar a sessão antes de qualquer comando administrativo." };
  }
  if (gate.commandMode !== "ready_for_controlled_commands") {
    return { isCommandFormAvailable: false, title: "Alçada ainda bloqueada", description: "A policy do servidor não liberou esta identidade para comandos controlados." };
  }
  return { isCommandFormAvailable: true, title: "Console liberada por política", description: "Cada envio continua requerendo validação, correlação, trilha e resposta do servidor." };
}
