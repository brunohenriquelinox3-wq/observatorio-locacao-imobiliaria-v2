export type ExecutionDisciplineLens = {
  key: "intent" | "decision" | "proof" | "learn";
  code: string;
  tab: string;
  title: string;
  text: string;
  promoted: string[];
  blocked: string;
  sources: Array<{ label: string; href: string }>;
};

export const executionDisciplineLenses: ExecutionDisciplineLens[] = [
  {
    key: "intent",
    code: "D-0",
    tab: "INTENÇÃO",
    title: "Antes de fazer, entender o que precisa ser provado.",
    text: "Toda mudança começa pelo problema, escopo, não-objetivo, owner, risco, hipótese, fonte e limite. O objetivo não é produzir um documento longo: é impedir que uma ideia ambígua chegue a código, dado ou operação como se já fosse requisito.",
    promoted: [
      "problema, resultado observável e limite declarados antes do trabalho",
      "fonte, conflito e confiança separados de decisão de produto",
      "classe de risco reavaliada quando o escopo muda",
    ],
    blocked: "Pressa, publicidade, memória, pedido incompleto ou autoridade informal não promovem hipótese para regra, backlog ou comando.",
    sources: [
      { label: "NIST · SSDF", href: "https://csrc.nist.gov/pubs/sp/800/218/final" },
      { label: "OWASP · ASVS", href: "https://owasp.org/www-project-application-security-verification-standard/" },
    ],
  },
  {
    key: "decision",
    code: "D-1",
    tab: "DECISÃO",
    title: "Uma decisão boa deixa alternativa, limite e responsável visíveis.",
    text: "Decidir não é ocultar conflito. A estratégia registra o que foi escolhido, o que foi rejeitado, quem valida o caso concreto, qual exceção reabre o tema e quais obrigações permanecem com jurídico, contador, DPO, engenharia ou parceiro habilitado.",
    promoted: [
      "owner, vigência, impacto e condição de reabertura para cada decisão relevante",
      "requisito observável derivado da decisão, não de preferência de interface",
      "limite explícito entre orquestração do CRM e responsabilidade profissional/externa",
    ],
    blocked: "Configuração de sistema não se apresenta como certeza jurídica, fiscal, registral, contábil, bancária ou de privacidade.",
    sources: [
      { label: "NIST · SSDF", href: "https://csrc.nist.gov/pubs/sp/800/218/final" },
      { label: "SLSA · cadeia de software", href: "https://slsa.dev/" },
    ],
  },
  {
    key: "proof",
    code: "D-2",
    tab: "PROVA",
    title: "O caminho feliz não basta: a prova tenta falhar com segurança.",
    text: "Cada requisito carrega sua tentativa de falha proporcional: validação local para apresentação, interação para lógica, allow/deny e migração isolada para dado, e idempotência, concorrência, timeout, reordenação, compensação e reconciliação para efeito externo ou econômico.",
    promoted: [
      "teste e revisão proporcionais a C0–C4, com critérios de aceite explícitos",
      "falha de permissão, duplicata, expiração e estado incerto tratadas como cenários de primeira classe",
      "preview e responsividade confirmam a jornada sem substituir policy ou transação",
    ],
    blocked: "Um teste verde isolado, um clique manual, uma tela bonita ou uma resposta de parceiro não confirmam por si só o efeito crítico.",
    sources: [
      { label: "OWASP · ASVS", href: "https://owasp.org/www-project-application-security-verification-standard/" },
      { label: "Playwright · boas práticas", href: "https://playwright.dev/docs/best-practices" },
    ],
  },
  {
    key: "learn",
    code: "D-3",
    tab: "APRENDIZADO",
    title: "Entregar é observar; falhar é melhorar a prova.",
    text: "Depois da promoção, sinal, correlação, owner e runbook confirmam se a jornada alcançou o resultado. Um desvio vira caso reproduzível sem dado real, regressão, ação corretiva, revisão de risco e decisão de retomada — nunca uma correção silenciosa que apaga história.",
    promoted: [
      "sinal saudável e sinal de falha definidos antes de promover a mudança",
      "incidente encerrado somente com reprodução, regressão e risco residual aceito",
      "freeze proporcional quando uma jornada crítica consome seu orçamento de erro",
    ],
    blocked: "Workaround, memória oral, exclusão de log ou anúncio de conclusão não encerram uma falha material nem autorizam repetir a mesma mudança.",
    sources: [
      { label: "OpenTelemetry · observabilidade", href: "https://opentelemetry.io/docs/concepts/observability-primer/" },
      { label: "Google SRE · orçamento de erro", href: "https://sre.google/workbook/error-budget-policy/" },
    ],
  },
];
