export type PlatformGovernanceOverviewInput = {
  isPlatformSuperAdmin: boolean;
  organizations?: number;
  principals?: number;
  grants?: number;
};

export function getPlatformGovernanceOverview(input: PlatformGovernanceOverviewInput) {
  return [
    {
      code: "01",
      title: "Plataforma",
      value: input.isPlatformSuperAdmin ? "SUPER ADM ativo" : "Alçada em verificação",
      detail: input.isPlatformSuperAdmin ? "A camada superior governa sem assumir permissões da organização." : "Sessão, MFA e papel ainda são avaliados pelo servidor.",
    },
    {
      code: "02",
      title: "Organizações",
      value: `${input.organizations ?? 0} ativada(s)`,
      detail: "Cada organização mantém contexto, membership e escopos próprios.",
    },
    {
      code: "03",
      title: "Módulos",
      value: "3 frentes liberadas",
      detail: "Loteadora, Vendas Urbanas e Locação continuam separadas por policy.",
    },
    {
      code: "04",
      title: "Delegações",
      value: `${input.grants ?? 0} grant(s) ativo(s)`,
      detail: "Uma delegação nunca é inferida a partir do papel SUPER ADM.",
    },
  ];
}
