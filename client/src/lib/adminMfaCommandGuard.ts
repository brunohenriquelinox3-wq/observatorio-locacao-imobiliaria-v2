export type MfaAttestedCommandGate = {
  consoleAvailable: boolean;
  sessionMfaVerified: boolean;
};

export type MfaAttestedCommandState = {
  allowed: boolean;
  title: string;
  description: string;
};

/** Complementa o gate server-side e nunca concede alçada localmente. */
export function getMfaAttestedCommandState(gate: MfaAttestedCommandGate): MfaAttestedCommandState {
  if (!gate.consoleAvailable) {
    return {
      allowed: false,
      title: "Console indisponível",
      description: "A política do servidor ainda não liberou esta identidade para comandos controlados.",
    };
  }
  if (!gate.sessionMfaVerified) {
    return {
      allowed: false,
      title: "Verifique MFA nesta sessão",
      description: "Este comando exige uma atestação TOTP recente no endereço atual antes de ser enviado ao servidor.",
    };
  }
  return {
    allowed: true,
    title: "Comando pronto para validação",
    description: "O servidor continuará confirmando MFA, papel, policy, correlação e demais pré-condições.",
  };
}
