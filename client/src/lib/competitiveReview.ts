export type CompetitiveReviewLens = {
  key: "floor" | "asset" | "finance" | "integration" | "redteam";
  code: string;
  tab: string;
  title: string;
  text: string;
  promoted: string[];
  blocked: string;
  sources: Array<{ label: string; href: string }>;
};

export const competitiveReviewLenses: CompetitiveReviewLens[] = [
  {
    key: "floor",
    code: "C1",
    tab: "PISO",
    title: "A venda rápida é a expectativa. O contexto é a prova.",
    text: "CV CRM, Jetimob, Sistemas GL, Facilita e Lote Mobile colocam mapa, funil, reserva, proposta e mobilidade no padrão de uma operação de loteadora. O CRM próprio mantém esse piso, mas não confunde uma experiência comercial fluida com a autoridade para vender, liberar ou pagar.",
    promoted: [
      "mapa/grade como leitura de unidade, fase e condição comercial",
      "reserva com expiração, fila, autoria e resposta determinística",
      "proposta, contrato e carteira como objetos conectados, não estados implícitos",
    ],
    blocked: "Nenhuma etiqueta de interface substitui registro, alocação, restrição, política de elegibilidade, alçada ou comando transacional.",
    sources: [
      { label: "CV CRM · loteadora", href: "https://cvcrm.com.br/cv-para-loteadora/" },
      { label: "Jetimob · loteadora", href: "https://www.jetimob.com/crm-loteadora" },
      { label: "Facilita · loteadoras", href: "https://appfacilita.com/loteadoras/" },
    ],
  },
  {
    key: "asset",
    code: "C2",
    tab: "ATIVO",
    title: "Disponibilidade é uma projeção; o ativo conserva mais dimensões.",
    text: "A referência competitiva confirma que espelho, tipologia, mapa e estoque orientam o campo. A estratégia supera o atalho ao derivar a elegibilidade de registro aplicável, modalidade, alocação, restrição, compromisso, tabela e alçada, com fonte e owner visíveis.",
    promoted: [
      "lote/unidade com registro, alocação, restrição, compromisso e carteira separados",
      "política de elegibilidade versionada e explicável por unidade",
      "distrato como caso de reentrada, sem reescrever estoque ou contrato",
    ],
    blocked: "A página do concorrente não prova o tratamento jurídico de matrícula, garantia, permuta, ônus, distrato ou modalidade de empreendimento; o CRM não declara regularidade.",
    sources: [
      { label: "Sistemas GL · CRM loteadora", href: "https://sistemasgl.com.br/modulos/crm-para-loteadoras/" },
      { label: "Lote Mobile · loteamentos", href: "https://lotemobile.com.br/" },
      { label: "Planalto · Lei 6.766", href: "https://www.planalto.gov.br/ccivil_03/leis/l6766.htm" },
    ],
  },
  {
    key: "finance",
    code: "C3",
    tab: "FINANCEIRO",
    title: "Cobrar é um fluxo. Liquidar e distribuir exigem fronteiras.",
    text: "Jetimob, Facilita, Supremo e Lote Mobile anunciam cobrança, comissão, repasse, conciliação ou contas a pagar. Airbnb explicita uma lição adicional: cota tem beneficiário, aceite, base, vigência, prioridade e caso de insuficiência. O CRM adota a governança do direito, não a regra de hospitalidade.",
    promoted: [
      "direito datado e reproduzível antes de instrução externa",
      "separação entre evento, entitlement, instrução, retorno, settlement e conciliação",
      "aceite, vigência, prioridade e exceção explícitos para beneficiários",
    ],
    blocked: "O CRM não é banco, liquidante, transmissor fiscal nem autoridade para retenções; parceiro habilitado, contador e jurídico validam o caso concreto.",
    sources: [
      { label: "Jetimob · recursos", href: "https://www.jetimob.com/recursos" },
      { label: "Facilita · pagamentos", href: "https://appfacilita.com/pagamentos/" },
      { label: "Airbnb · cotas de coanfitrião", href: "https://www.airbnb.com.br/help/article/3389" },
    ],
  },
  {
    key: "integration",
    code: "C4",
    tab: "INTEGRAÇÃO",
    title: "Integração é um contrato de dados, não uma parede de logos.",
    text: "Ecossistemas de ERP, assinatura, banco, portal, marketing, API e BI aparecem em quase todas as referências. Salesforce adiciona a referência de dados harmonizados, identidade e política. A resposta estratégica é integração por ownership, correlação, contrato, replay seguro e reconciliação — não sincronia implícita.",
    promoted: [
      "fonte de verdade, direção e finalidade registradas por fluxo",
      "outbox/inbox, idempotência, correlação, retry e divergência",
      "política por organização, escopo, evidência e dado mínimo",
    ],
    blocked: "Uma integração anunciada não prova SLA, consistência, cobertura contratada, LGPD, RLS, segurança de webhook ou autoridade sobre saldo/documento.",
    sources: [
      { label: "CV CRM · integrações", href: "https://cvcrm.com.br/integracoes/" },
      { label: "Lote Mobile · obras", href: "https://lotemobile.com.br/obras" },
      { label: "Salesforce · Data 360", href: "https://www.salesforce.com/br/data/" },
    ],
  },
  {
    key: "redteam",
    code: "C5",
    tab: "PENTE FINO",
    title: "Promessa comercial não é prova operacional.",
    text: "O quinto ciclo confronta termos que parecem completos — ‘tempo real’, ‘automático’, ‘tudo em um’, ‘IA’ e ‘pagamento integrado’. A estratégia não afirma lacuna técnica de concorrente sem evidência; ela recusa promover uma promessa ao produto sem owner, limite, teste de falha e decisão rastreável.",
    promoted: [
      "critérios de aceite por concorrência, duplicata, timeout, retorno tardio e reversão",
      "IA com fonte, incerteza, política de acesso, revisão e kill switch",
      "produto especializado por domínio, sem imitar banco ou ERP completo",
    ],
    blocked: "Ausência de evidência pública não é ausência de capacidade. A diferenciação só pode ser declarada depois de teste, piloto e prova operacional própria.",
    sources: [
      { label: "Imobibrasil · plataforma", href: "https://www.imobibrasil.com.br/" },
      { label: "Supremo · gestão de locação", href: "https://supremocrm.com.br/sistema-de-gestao-de-locacao/" },
      { label: "Salesforce · Customer 360", href: "https://www.salesforce.com/br/products/what-is-customer-360/" },
    ],
  },
];
