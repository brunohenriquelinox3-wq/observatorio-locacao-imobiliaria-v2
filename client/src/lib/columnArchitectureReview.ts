export type ColumnArchitectureLens = {
  key: "super-admin" | "adm" | "loteadora" | "vendas-urbanas" | "locacao";
  code: string;
  tab: string;
  title: string;
  text: string;
  promoted: string[];
  blocked: string;
  sources: Array<{ label: string; href: string }>;
};

export const columnArchitectureLenses: ColumnArchitectureLens[] = [
  {
    key: "super-admin",
    code: "COL-01",
    tab: "SUPER ADM",
    title: "A plataforma administra contratos SaaS sem atravessar o tenant por padrão.",
    text: "Dashboard geral, clientes contratantes, financeiro SaaS, módulos e colaboradores internos pertencem à empresa operadora do CRM. A visão de plataforma não transforma suporte em acesso irrestrito a clientes, documentos, carteira ou saldo do contratante.",
    promoted: [
      "cliente da plataforma é a organização contratante, não o comprador, locatário ou proprietário final",
      "financeiro Super Adm registra faturas, planos, custos e recebíveis do SaaS, separado das carteiras dos clientes",
      "suporte usa escopo mínimo, justificativa, MFA/step-up, expiração e audit event append-only",
    ],
    blocked: "Um papel de plataforma não lê dados operacionais de tenant sem caso JIT aprovado; habilitar módulo ou abrir dashboard não cria grant de cliente.",
    sources: [
      { label: "Contrato administrativo", href: "/crm_fundacao_administrativa_contrato_v0.md" },
      { label: "Árvore canônica", href: "/crm_arquitetura_colunas_setores_canonica.md" },
    ],
  },
  {
    key: "adm",
    code: "COL-02",
    tab: "ADM",
    title: "O dono administra sua organização e os módulos que contratou.",
    text: "Painel ADM, módulos habilitados, colaboradores, parâmetros autorizados e visão financeira própria ficam dentro da organização atual. A coluna mostra o que foi contratado, mas cada pessoa continua precisando de membership, grant, escopo, vigência e alçada compatíveis.",
    promoted: [
      "módulo contratado habilita capacidade para a organização; não concede acesso automático a uma pessoa",
      "financeiro ADM projeta o subledger autorizado por entidade legal, carteira e alçada; não é saldo global editável",
      "convite, suspensão, revogação e parâmetro crítico preservam versão, MFA e trilha administrativa",
    ],
    blocked: "ADM não gerencia outra organização, não se autoeleva, não remove o último owner e não usa preferência de menu como fonte de autorização.",
    sources: [
      { label: "Domínio organizacional", href: "/crm_dominio_organizacional.md" },
      { label: "Consolidação por coluna", href: "/crm_arquitetura_colunas_setores_consolidacao.md" },
    ],
  },
  {
    key: "loteadora",
    code: "COL-03",
    tab: "LOTEADORA",
    title: "Estoque, parceiros, venda, contrato e carteira contam a mesma história.",
    text: "A coluna conecta gleba, empreendimento, fase, quadra, lote, disponibilidade, parceiro/fazendeiro, cliente, reserva, venda, contrato, boletos e carteira. O financeiro é o coração de controle, porém boleto continua sendo instrução até retorno, correlação e conciliação.",
    promoted: [
      "fazendeiro/proprietário da terra é Parte com papel, instrumento, objeto, vigência e condição; não uma exceção informal",
      "CPF/CNPJ, proponente principal e coadquirente são buscas protegidas dentro do contexto autorizado",
      "estoque só fica elegível com registro, alocação, restrição, compromisso, tabela e alçada compatíveis",
    ],
    blocked: "Status comercial manual, boleto emitido, comprovante isolado ou percentual genérico não podem confirmar venda, caixa, repasse, retorno de estoque ou direito econômico.",
    sources: [
      { label: "Domínio de loteadora", href: "/crm_dominio_loteadora.md" },
      { label: "Confronto de colunas", href: "/crm_arquitetura_colunas_setores_confronto.md" },
    ],
  },
  {
    key: "vendas-urbanas",
    code: "COL-04",
    tab: "VENDAS URBANAS",
    title: "Cliente, proprietário, imóvel, construtora, venda e comissão permanecem distintos.",
    text: "A coluna trata imóveis urbanos de lote a kitnet, além de torres, condomínios e unidades de construtoras. Ela liga partes, ativo, autorização, proposta, contrato e direitos de comissão, sem tratar consulta cadastral, percentual ou venda como confirmação automática de poder, caixa ou pagamento.",
    promoted: [
      "proprietário, proponente, comprador, corretor, construtora e correspondente são papéis datados de uma Parte única",
      "imóvel, empreendimento, torre e unidade preservam identidade, evidência e disponibilidade próprias",
      "comissão parcelada possui regra, base, gatilho, teto, versão, documento e estado antes de qualquer instrução",
    ],
    blocked: "CNPJ/QSA, rótulo de correspondente, proposta aprovada ou comissão percentual não substituem poder revisado, contrato, policy fiscal, settlement ou conciliação.",
    sources: [
      { label: "Modelo canônico", href: "/crm_modelo_canonico.md" },
      { label: "Subledger", href: "/crm_subledger_imobiliaria.md" },
    ],
  },
  {
    key: "locacao",
    code: "COL-05",
    tab: "LOCAÇÃO",
    title: "Administrar o imóvel e alugar o imóvel são contratos relacionados, não o mesmo prazo.",
    text: "A coluna une cliente/locatário, proprietário, imóvel, administração, locação, cobrança, carteira, repasse, inadimplência e renovação. O portal de cliente ou proprietário é mínimo por finalidade e a liquidação só se confirma com evento externo correlacionado e conciliação.",
    promoted: [
      "contrato de administração com proprietário e contrato de locação com locatário têm vigências, obrigações e estados próprios",
      "cobrança, cash application, settlement, dedução, taxa e repasse preservam natureza econômica e evidência",
      "portal exibe apenas imóveis, contratos, documentos e contas explicitamente autorizados",
    ],
    blocked: "Emitir boleto, anexar comprovante, abrir portal ou encerrar locação não confirma pagamento, quitação, repasse ou acesso além do escopo permitido.",
    sources: [
      { label: "Subledger de locação", href: "/crm_subledger_imobiliaria.md" },
      { label: "Arquitetura de colunas", href: "/crm_arquitetura_colunas_setores_canonica.md" },
    ],
  },
];
