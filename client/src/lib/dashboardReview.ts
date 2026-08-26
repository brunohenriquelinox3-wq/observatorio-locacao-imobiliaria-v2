export type DashboardReviewLens = {
  key: "metric" | "visual" | "interaction" | "accessibility";
  code: string;
  tab: string;
  title: string;
  text: string;
  promoted: string[];
  blocked: string;
  sources: Array<{ label: string; href: string }>;
};

export const dashboardReviewLenses: DashboardReviewLens[] = [
  {
    key: "metric",
    code: "DV-01",
    tab: "MÉTRICA",
    title: "Antes de desenhar, o número precisa explicar de onde vem e o que significa.",
    text: "KPI, funil, carteira, estoque ou alerta só entram no painel com fórmula, unidade, denominador, período, escopo, fonte, frescor, estado, limitação e owner. Um card sem contrato é uma opinião com aparência de precisão.",
    promoted: [
      "MetricDefinition versionada: fórmula, unidade, polaridade, inclusão, exclusão, janela, timezone e owner",
      "MetricLineage com fonte, as_of, frescor, confiança, limitação, aprovação e política de leitura",
      "VGV, receita própria, valor de terceiro, previsão, settlement e inadimplência preservam naturezas e estados distintos",
    ],
    blocked: "Rótulos como receita, caixa, estoque, conversão ou inadimplência não podem representar números reais sem definição, recorte, prova e estado econômico explícitos.",
    sources: [
      { label: "Caderno de métricas", href: "/crm_dashboard_visualizacao_consolidacao.md" },
      { label: "Subledger", href: "/crm_subledger_imobiliaria.md" },
    ],
  },
  {
    key: "visual",
    code: "DV-02",
    tab: "VISUAL",
    title: "A pergunta escolhe o gráfico; a tabela conserva a precisão.",
    text: "Barras comparam, linhas mostram tempo, funis mostram sequência, mapas mostram território e tabelas explicam valores. O gráfico abre uma investigação, não substitui o caso, a regra, a evidência ou o dado que a pessoa precisa conferir.",
    promoted: [
      "VisualizationSpec declara intenção, encoding, unidade, baseline, escala, ordem, comparação e fallback de tabela",
      "funil exige etapas ordenadas, coorte, reentrada, denominadores compatíveis e conversão entre etapas",
      "gráfico material oferece título, insight, fonte, período, recorte, estado e tabela/descrição equivalente",
    ],
    blocked: "Donut, gauge, gradiente, gráfico de funil ou sparkline não entram para ornamentar; nem podem esconder escala, comparação, perda, incerteza ou valor absoluto.",
    sources: [
      { label: "WAI · imagens complexas", href: "https://www.w3.org/WAI/tutorials/images/complex/" },
      { label: "Sistema visual", href: "/crm_sistema_visual.md" },
    ],
  },
  {
    key: "interaction",
    code: "DV-03",
    tab: "RECORTE",
    title: "Filtrar, aprofundar e exportar são comandos de dados — não decoração de dashboard.",
    text: "Período, organização, SPE, carteira, empreendimento, origem ou corretor formam um recorte reproduzível. Drill-down, cross-filter e exportação mantêm policy, correlação, estado de carregamento, parcialidade, erro e trilha de auditoria.",
    promoted: [
      "DashboardQuery server-side com escopo, filtros, policy, versão, correlação, limite e snapshot",
      "frescor/as_of e estado incerto visíveis; tempo real nunca significa settlement, reserva ou dado externo confirmado",
      "exportação depende de finalidade, permissão, conteúdo permitido, lote/watermark, retenção e audit event",
    ],
    blocked: "Um filtro de interface não amplia acesso, uma URL não ultrapassa RLS e um callback não atualiza um KPI crítico sem correlação e reconciliação.",
    sources: [
      { label: "Auditoria integral", href: "/crm_auditoria_integral_relatorio_20260826.md" },
      { label: "Diretriz sem atalhos", href: "/crm_diretriz_execucao_sem_atalhos.md" },
    ],
  },
  {
    key: "accessibility",
    code: "DV-04",
    tab: "ACESSO",
    title: "Um gráfico confiável continua legível sem cor, hover ou mouse.",
    text: "Séries, deltas, estados e controles usam texto, forma, posição ou padrão além de cor. A visualização oferece resumo e tabela semântica; interação funciona por teclado e toque; contraste, foco e movimento reduzido são provados no tema real.",
    promoted: [
      "descrição curta/longa e tabela com cabeçalhos, unidade, recorte e valores equivalentes ao gráfico",
      "tooltip ou detalhe acionável por foco/toque, sem depender somente de mousemove ou SVG decorativo",
      "cor semântica acompanhada de rótulo/sinal/forma; objetos gráficos e foco necessários passam contraste aplicável",
    ],
    blocked: "Série invisível, delta apenas verde/vermelho, SVG sem alternativa, controle sem nome/foco ou tabela sem cabeçalho não passam como painel moderno ou acessível.",
    sources: [
      { label: "WCAG · uso de cor", href: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html" },
      { label: "WCAG · contraste não textual", href: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html" },
    ],
  },
];
