export type StudyIntegrationLens = {
  key: "payments" | "assets" | "boundaries";
  code: string;
  title: string;
  text: string;
  promoted: string[];
  blocked: string;
  sources: Array<{ label: string; href: string }>;
};

export const integrationBenefits = [
  "explorar os dados de forma mais intuitiva",
  "entender melhor as tendências",
  "salvar ou compartilhar facilmente",
] as const;

export const integrationLenses: StudyIntegrationLens[] = [
  {
    key: "payments",
    code: "PAG-01",
    title: "Direito não é instrução. Instrução não é liquidação.",
    text: "A auditoria preserva a cadeia financeira como uma sequência verificável: evento econômico, direito calculado, instrução aprovada, tentativa/retorno de parceiro, settlement e conciliação. Cada saída também declara a sua natureza, sem misturar repasse de terceiro, comissão e distribuição de resultado.",
    promoted: [
      "cascata datada com tipo de base, ordem, gatilho e reversão",
      "exceção individual para recebedor, tentativa, retorno e settlement",
      "comprovante tratado como evidência recebida, não como caixa confirmado",
    ],
    blocked: "Nenhum comando financeiro real foi habilitado. Liquidação continua com parceiro contratado/habilitado e validação contextual de financeiro, contador e jurídico.",
    sources: [
      { label: "Receita · DIMOB", href: "https://www.gov.br/receitafederal/pt-br/assuntos/orientacao-tributaria/declaracoes-e-demonstrativos/dimob" },
      { label: "Stripe · idempotência", href: "https://docs.stripe.com/api/idempotent_requests" },
    ],
  },
  {
    key: "assets",
    code: "ATV-02",
    title: "Ativo é uma linha de evidências — não um rótulo de estoque.",
    text: "Gleba, empreendimento, quadra, lote e unidade precisam conservar identidade, origem, registro, restrição, alocação, disponibilidade e carteira em dimensões próprias. Uma razão de bloqueio só é liberada com fonte, vigência e alçada compatíveis.",
    promoted: [
      "matrícula/referência e certidão versionada, com data, escopo e revisão",
      "origem/participação da terra ligada ao instrumento e ao direito econômico",
      "registro pendente, garantia, alocação, reserva e disputa como restrições explicáveis",
    ],
    blocked: "O CRM não declara regularidade nem libera venda por um campo de cadastro. Operação, jurídico imobiliário e registro validam o caso concreto.",
    sources: [
      { label: "Planalto · Lei 6.766", href: "https://www.planalto.gov.br/ccivil_03/leis/l6766.htm" },
      { label: "Planalto · Lei 6.015", href: "https://www.planalto.gov.br/ccivil_03/leis/l6015compilada.htm" },
    ],
  },
  {
    key: "boundaries",
    code: "GOV-03",
    title: "Contrato, versão e especialista decidem o que a interface não pode supor.",
    text: "Distrato, garantia, antecipação, afetação, RET, outorga, índices e retenções surgem no produto como casos, documentos e regras datadas. O sistema mostra o que falta e conserva a decisão; não converte exceções legais e contratuais em constantes escondidas.",
    promoted: [
      "quadro-resumo e documento de origem como gates revisáveis",
      "fato compensatório para estorno, distrato e correção, sem apagar história",
      "owners explícitos para jurídico, contador/controladoria e parceiro habilitado",
    ],
    blocked: "Esta revisão não autoriza migration, RPC, bootstrap, integração de pagamento ou publicação. Cada mudança operativa ainda requer apresentação e aprovação explícita.",
    sources: [
      { label: "Planalto · Lei 13.786", href: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13786.htm" },
      { label: "Planalto · Lei 10.931", href: "https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2004/lei/l10.931.htm" },
    ],
  },
];
