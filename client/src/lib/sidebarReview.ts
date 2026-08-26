export type SidebarReviewLens = {
  key: "tree" | "route" | "collapse" | "drawer";
  code: string;
  tab: string;
  title: string;
  text: string;
  promoted: string[];
  blocked: string;
  sources: Array<{ label: string; href: string }>;
};

export const sidebarReviewLenses: SidebarReviewLens[] = [
  {
    key: "tree",
    code: "SB-01",
    tab: "ÁRVORE",
    title: "Navegação é uma árvore de tarefas, não um organograma disfarçado.",
    text: "A barra agrupa por contexto e frequência, com até dois níveis. Cada nó descreve rota, prioridade, capability e feature flag; a estrutura pode mudar sem espalhar marcação pela interface.",
    promoted: [
      "section, item e group declarativos, com lista semântica e um único padrão visual",
      "link para destino e botão apenas para disclosure, sem widget ARIA desnecessário",
      "terceiro nível deslocado para a tela, busca ou ação contextual",
    ],
    blocked: "Rótulo de área, organograma, menu oculto ou ícone decorativo não determinam prioridade, acesso ou arquitetura de informação.",
    sources: [
      { label: "WAI · disclosure navigation", href: "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/" },
      { label: "WAI · disclosure", href: "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/" },
    ],
  },
  {
    key: "route",
    code: "SB-02",
    tab: "ROTA & ESCOPO",
    title: "A posição atual vem da rota e do escopo real, não de um clique local.",
    text: "O destino atual, seu ancestral e sua disponibilidade derivam de rota, organização, SPE, capability e feature flag. A barra explica orientação; as políticas continuam decidindo leitura e comando fora da interface.",
    promoted: [
      "ancestral aberto para rota descendente, com aria-current no destino atual",
      "deep link, back/forward, troca de organização e revogação testados",
      "badge e item sensível somente com dado já autorizado para descoberta",
    ],
    blocked: "Ocultar um item não protege URL, API, arquivo, exportação, saldo ou comando; policy/RLS e alçada permanecem a fronteira real.",
    sources: [
      { label: "WCAG · ordem de foco", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html" },
      { label: "WAI · disclosure navigation", href: "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/" },
    ],
  },
  {
    key: "collapse",
    code: "SB-03",
    tab: "RECOLHER",
    title: "Dar espaço não pode retirar orientação ou teclado.",
    text: "Expandida, a barra sustenta rótulo e agrupamento. Recolhida, cada ícone conserva nome acessível, foco, tooltip/flyout operável e saída previsível por Escape ou toque. A preferência é visual, nunca autorização.",
    promoted: [
      "tokens de largura, densidade e movimento reduzido para estados expandido/colapsado",
      "tooltip/flyout por foco e ação explícita, não somente hover",
      "foco visível, contraste e alvo proporcional ao contexto de uso",
    ],
    blocked: "Icon rail sem nome acessível, flyout preso, cor isolada, rótulo de ação desatualizado ou localStorage usado como capability não passam de atalho visual.",
    sources: [
      { label: "WCAG · foco", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html" },
      { label: "WCAG · alvo", href: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html" },
    ],
  },
  {
    key: "drawer",
    code: "SB-04",
    tab: "MOBILE",
    title: "No mobile, a gaveta é uma interação completa — não uma barra empurrada para fora.",
    text: "A navegação móvel abre como drawer somente quando existe foco inicial, conteúdo de fundo inerte, contenção de Tab, fechamento por Escape/controle visível e retorno ao gatilho. Sem esse contrato, não será tratada como modal.",
    promoted: [
      "gatilho nomeado, foco inicial e botão de fechamento sempre disponíveis",
      "Tab/Shift+Tab contidos e foco devolvido ao gatilho ao fechar",
      "validação por teclado, leitor de tela, zoom, overlay e mudança de orientação",
    ],
    blocked: "Overlay escuro, clique fora e animação não bastam se o fundo ainda recebe foco ou a pessoa perde o ponto de retorno.",
    sources: [
      { label: "WAI · diálogo modal", href: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" },
      { label: "WCAG · ordem de foco", href: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html" },
    ],
  },
];
