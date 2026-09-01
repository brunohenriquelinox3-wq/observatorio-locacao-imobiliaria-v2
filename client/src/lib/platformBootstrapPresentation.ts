export type BootstrapPresentation = {
  headline: string;
  actionLabel: string;
  actionDisabled: boolean;
  heroText: string;
  principalMetricText: string;
  ledgerPrincipalText: string;
};

export function getPlatformBootstrapPresentation(input: { identityState?: string; bootstrapAction?: string; mfaVerified: boolean; platformRole?: string | null }): BootstrapPresentation {
  if (input.identityState === "active") {
    const isPlatformSuperAdmin = input.platformRole === "platform_super_admin";
    return {
      headline: isPlatformSuperAdmin
        ? "SUPER ADM de plataforma ativo; delegações continuam governadas"
        : "Principal de plataforma ativo; delegações continuam governadas",
      actionLabel: "Bootstrap inicial concluído",
      actionDisabled: true,
      heroText: isPlatformSuperAdmin
        ? "O papel SUPER ADM de plataforma foi ativado com controles. Organizações, memberships, grants e comandos delegados continuam sujeitos a policy, correlação, escopo e vigência."
        : "O principal de plataforma foi ativado com controles; organizações, memberships, grants e comandos delegados continuam sujeitos a policy, correlação, escopo e vigência.",
      principalMetricText: isPlatformSuperAdmin
        ? "SUPER ADM de plataforma ativo; grants delegados seguem separados."
        : "Principal de plataforma ativo; grants delegados seguem separados.",
      ledgerPrincipalText: isPlatformSuperAdmin
        ? "SUPER ADM de plataforma ativo; nenhuma concessão duplicada é necessária."
        : "Principal de plataforma ativo; delegações continuam separadas.",
    };
  }

  if (input.bootstrapAction === "available") {
    return {
      headline: "Bootstrap pendente é necessário antes da ativação",
      actionLabel: "Preparar bootstrap",
      actionDisabled: false,
      heroText: "A identidade e o MFA permitem somente a preparação controlada do principal; nenhuma alçada é concedida nessa etapa.",
      principalMetricText: "Bootstrap ainda exige controles adicionais.",
      ledgerPrincipalText: "Aguarda bootstrap governado.",
    };
  }

  if (input.identityState === "pending_activation") {
    return {
      headline: input.mfaVerified ? "Pronto para pedir atestação" : "MFA precisa ser verificado nesta sessão",
      actionLabel: input.mfaVerified ? "Pedir ativação controlada" : "Ver requisito",
      actionDisabled: !input.mfaVerified,
      heroText: "A pendência de principal ainda exige MFA recente, recuperação verificada e decisão transacional do servidor.",
      principalMetricText: "Principal pendente; sem alçada ativa.",
      ledgerPrincipalText: "Pendência criada; aguarda ativação controlada.",
    };
  }

  return {
    headline: "Bootstrap pendente é necessário antes da ativação",
    actionLabel: "Ver requisito",
    actionDisabled: true,
    heroText: "A central continua fechada por padrão até a identidade cumprir os pré-requisitos aplicáveis.",
    principalMetricText: "Bootstrap ainda exige controles adicionais.",
    ledgerPrincipalText: "Aguarda bootstrap governado.",
  };
}
