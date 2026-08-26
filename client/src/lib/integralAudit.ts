export type IntegralAuditLens = {
  key: "verdict" | "p0" | "boundary" | "sequence";
  code: string;
  tab: string;
  title: string;
  text: string;
  points: string[];
  blocked: string;
  sources: Array<{ label: string; href: string }>;
};

export const integralAuditLenses: IntegralAuditLens[] = [
  {
    key: "verdict",
    code: "INT-00",
    tab: "VEREDITO",
    title: "A estratégia cobre o domínio; a operação ainda precisa provar cada fronteira.",
    text: "A auditoria não encontrou uma vertical central esquecida. Ela confirmou uma tese consistente para produto, loteadora, financeiro, acesso, plataforma, UX e pesquisa, mas recusou confundir esse alcance com capacidade pronta em produção.",
    points: [
      "cobertura alta para decisões de produto, domínio e limite profissional",
      "prontidão parcial enquanto commands, policies, integrações e recovery permanecem pendentes",
      "lacuna deliberada fica visível, com owner e prova de fechamento — não vira promessa",
    ],
    blocked: "Documento, mock, tela ou build não comprovam autorização, liquidação, registro, escala, recuperação ou validação profissional.",
    sources: [
      { label: "OWASP · ASVS", href: "https://owasp.org/www-project-application-security-verification-standard/" },
      { label: "NIST · Zero Trust", href: "https://www.nist.gov/programs-projects/zero-trust-networks" },
    ],
  },
  {
    key: "p0",
    code: "INT-01",
    tab: "P0 · GATES",
    title: "Nada de alto impacto atravessa a fundação por atalho.",
    text: "A prioridade zero não é uma tela: é a fronteira autoritativa de Supabase, RLS/policy, comando transacional, MFA, auditoria runtime, correlação e recuperação. Sem ela, reserva, direito, grant ou callback só podem existir em desenho.",
    points: [
      "matriz permitir/negar por tabela, arquivo, comando e escopo",
      "catálogo de comandos com versão, idempotência, alçada e compensação",
      "SLO, runbook, correlação e exercício de recuperação antes de automação",
    ],
    blocked: "Uma UI administrativa vazia ou uma migration deny-by-default não autorizam bootstrap, grant, pagamento, lote ou contrato reais.",
    sources: [
      { label: "OWASP · API Security", href: "https://owasp.org/API-Security/editions/2023/en/0x11-t10/" },
      { label: "OpenTelemetry · sinais", href: "https://opentelemetry.io/docs/concepts/signals/" },
    ],
  },
  {
    key: "boundary",
    code: "INT-02",
    tab: "LIMITES",
    title: "O CRM governa contexto; especialista e parceiro governam o caso concreto.",
    text: "Registro, regra municipal, fiscalidade, contabilidade, capacidade de split, liquidação e retenção precisam de owner, evidência, vigência e contrato. A plataforma conserva a decisão e bloqueia o ato quando a prova contextual falta.",
    points: [
      "jurídico, urbanismo, contador, DPO e parceiro habilitado aparecem como owners explícitos",
      "regra universal é substituída por perfil, policy datada, documento e exceção",
      "capacidade de provedor é homologada por sandbox antes de qualquer instrução financeira",
    ],
    blocked: "Percentual, matrícula, comprovante, API ou rótulo de parceiro não se tornam verdade universal por configuração de tela.",
    sources: [
      { label: "NIST · AI RMF", href: "https://www.nist.gov/itl/ai-risk-management-framework" },
      { label: "Google SRE · SLOs", href: "https://sre.google/workbook/implementing-slos/" },
    ],
  },
  {
    key: "sequence",
    code: "INT-03",
    tab: "SEQUÊNCIA",
    title: "A próxima melhoria começa pela menor mudança que já pode ser provada.",
    text: "A ordem de correção evita duas autoridades de dados, automatismo financeiro e escala sem operação. Primeiro vocabulário e fronteira; depois administração segura e núcleo autorizado; então loteadora/subledger em piloto; por fim integrações, IA e escala.",
    points: [
      "A · glossário e ADR de autoridade antes de schema de negócio",
      "B/C · administração segura, RLS e núcleo operacional com dados sintéticos",
      "D/E · loteadora, subledger, parceiro, IA e escala somente após gates de prova",
    ],
    blocked: "Urgência comercial não inverte ondas, não remove teste e não substitui homologação, piloto, recuperação ou decisão do owner.",
    sources: [
      { label: "NIST · SSDF", href: "https://csrc.nist.gov/projects/ssdf" },
      { label: "SLSA · integridade", href: "https://slsa.dev/" },
    ],
  },
];
