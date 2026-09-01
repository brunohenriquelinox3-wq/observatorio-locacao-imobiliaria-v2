export function getPlatformIdentityPresentation(identityState: string | undefined) {
  const isConnected = identityState === "connected";
  return {
    isConnected,
    title: isConnected
      ? "Identidade Supabase vinculada à sessão atual."
      : "Conecte a identidade que poderá iniciar o bootstrap, sem ganhar privilégio automático.",
    description: isConnected
      ? "A conexão manual está ocultada para não exibir e-mail ou senha. MFA e recuperação permanecem disponíveis pelo fluxo protegido."
      : "A conexão só consulta o provedor; o cadastro é uma ação manual explícita. Nenhuma opção envia convite, atribui papel administrativo ou ativa alçada por e-mail.",
  };
}
