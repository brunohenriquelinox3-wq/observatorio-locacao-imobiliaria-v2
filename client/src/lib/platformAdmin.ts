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
    reason: "O comando transacional ainda não foi implantado; a fundação permanece em modo de leitura segura.",
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
    label: "Ativar principal inicial",
    reason: "O bootstrap permanece indisponível até a função interna, o MFA e o canal de recuperação serem validados.",
  },
};

export function getPlatformCommandState(command: PlatformCommand): PlatformCommandState {
  return foundationCommandStates[command];
}

export function allFoundationCommandsBlocked(): boolean {
  return platformCommands.every(command => !getPlatformCommandState(command).enabled);
}
