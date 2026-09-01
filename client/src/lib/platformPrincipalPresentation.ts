type PrincipalState = {
  identityState?: string;
  commandMode?: string;
  platformRole?: string | null;
};

export function getPlatformPrincipalPresentation(state: PrincipalState) {
  const isPlatformSuperAdmin = state.identityState === "active"
    && state.commandMode === "ready_for_controlled_commands"
    && state.platformRole === "platform_super_admin";

  if (isPlatformSuperAdmin) {
    return {
      isPlatformSuperAdmin,
      activeFoundationStatus: "SUPER ADM de plataforma ativo · comandos controlados",
      identityStatus: "SUPER ADM de plataforma ativo · alçadas delegadas pendentes",
      activationHeadline: "SUPER ADM de plataforma ativo; organizações e grants seguem governados",
      bootstrapCardLabel: "Bootstrap inicial concluído",
      bootstrapCardReason: "O papel de plataforma foi ativado. Não há concessão duplicada; organizações e delegações continuam exigindo policy e correlação.",
    };
  }

  return {
    isPlatformSuperAdmin,
    activeFoundationStatus: "Principal de plataforma ativo · comandos controlados",
    identityStatus: "Identidade Supabase conectada · alçada pendente",
    activationHeadline: "Bootstrap pendente e necessário antes da ativação",
    bootstrapCardLabel: "Preparar principal inicial",
    bootstrapCardReason: "O bootstrap cria somente uma pendência controlada; a ativação exige MFA e recuperação verificadas.",
  };
}
