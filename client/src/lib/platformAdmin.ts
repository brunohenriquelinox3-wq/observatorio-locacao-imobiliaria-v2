export const platformCommands = [
  "provisionOrganization",
  "grantMembership",
  "revokeMembership",
  "activateBootstrap",
] as const;

export type PlatformCommand = (typeof platformCommands)[number];

export type PlatformCommandState = {
  enabled: boolean;
  label: string;
  reason: string;
};

const foundationCommandStates: Record<PlatformCommand, PlatformCommandState> = {
  provisionOrganization: {
    enabled: false,
    label: "Criar organização",
    reason: "O comando governado está disponível no console transacional e continua exigindo MFA recente, correlação, idempotência e policy no servidor.",
  },
  grantMembership: {
    enabled: false,
    label: "Conceder alçada",
    reason: "A concessão exige RPC, MFA recente, separação de deveres e trilha de auditoria da próxima subetapa.",
  },
  revokeMembership: {
    enabled: false,
    label: "Revogar acesso",
    reason: "A revogação só será habilitada após a invalidação de sessão e as provas permitir/negar estarem implementadas.",
  },
  activateBootstrap: {
    enabled: false,
    label: "Preparar principal inicial",
    reason: "O bootstrap só cria uma pendência vinculada à identidade Supabase; MFA, recuperação e ativação continuam obrigatórios.",
  },
};

export function getPlatformCommandState(command: PlatformCommand): PlatformCommandState {
  return foundationCommandStates[command];
}

export function allFoundationCommandsBlocked(): boolean {
  return platformCommands.every(command => !getPlatformCommandState(command).enabled);
}

export function canLoadIdentityState(isAuthenticated: boolean): boolean {
  return isAuthenticated;
}

export function canLoadAdministrativeState(isAuthenticated: boolean, role: "admin" | "user" | undefined): boolean {
  return isAuthenticated && role === "admin";
}
