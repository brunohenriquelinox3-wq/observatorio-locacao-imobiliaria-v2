# Caderno de evidências — visualização e experiência de CRM

## Captura 01 — gráficos e dashboards

| Fonte | Achado verificável | Impacto para o CRM | Limitação |
| --- | --- | --- | --- |
| Nielsen Norman Group, *Dashboards: Making Charts and Graphs Easier to Understand* | Painéis operacionais visam resposta rápida; comprimento e posição bidimensional permitem comparação quantitativa mais imediata que área ou ângulo. [1] | KPI, barra, linha, bullet e dispersão devem ser os padrões para acompanhamento de carteira, funil, SLA e exceção. | Texto de 2017; princípio perceptivo continua útil, mas não substitui teste no domínio imobiliário. |
| Nielsen Norman Group, *Choosing Chart Types: Consider Context* | Contexto, ausência de ruído e contraste orientam a escolha; barras, linhas e dispersão cobrem grande parte das perguntas usuais. [2] | Toda visualização deve declarar pergunta, comparação e ação esperada; gráficos complexos ficam para exploração, não para a primeira tela. | Foco editorial em dados de UX, transferido por analogia para CRM. |
| IBM Carbon, *Chart types* | O sistema organiza gráficos por comparação, tendência, parte-do-todo, correlação, conexões e geoespacialidade. [3] | O catálogo do CRM terá uma taxonomia de pergunta antes de uma biblioteca de componentes. | É um design system de fornecedor; não equivale a evidência de desempenho de negócio. |
| IBM Carbon, *Chart anatomy* | Título qualitativo, legenda que explique a codificação, rótulo direto quando possível, tooltip com contexto e eixos/ticks que preservem escala são partes do gráfico. [4] | Todo gráfico precisa de título-insight, unidade, período, fonte, vazio/carregando/erro e caminho para detalhe. | Alguns componentes ainda são declarados como work in progress pela fonte. |

## Decisões provisórias

1. **A primeira camada do CRM será de decisão, não de decoração.** Gráficos devem responder a uma pergunta de operação e abrir a lista de casos correspondente.
2. **Cor não será o único código de significado.** Estado crítico combinará texto, ícone, posição, contraste e cor semântica.
3. **Pizza, donut, gauge e 3D não serão padrão de comparação.** Só entram quando a pergunta for estritamente parte-do-todo ou status singular e houver alternativa textual acessível.

## Captura 02 — cor, contraste e acesso aos dados

| Fonte | Achado verificável | Impacto para o CRM | Limitação |
| --- | --- | --- | --- |
| W3C WAI, *Use of Color* | Cor não pode ser o único meio de comunicar informação, ação, resposta ou distinção; texto, forma ou outro sinal visível devem complementar a cor. [5] | Risco, atraso, situação de reserva, conciliação e compliance terão rótulo, ícone/forma e cor semântica. | Critério de conformidade; não prescreve uma paleta comercial específica. |
| W3C WAI, *Contrast (Minimum)* | Texto normal requer contraste mínimo de 4,5:1 e texto grande de 3:1; contraste de luminância é central para legibilidade. [6] | Tokens de texto, link, rótulo e botão serão validados em todos os fundos e estados. | Mínimo normativo não é sinônimo de melhor legibilidade em todas as condições. |
| W3C WAI, *Non-text Contrast* | Componentes e objetos gráficos necessários à compreensão requerem contraste mínimo de 3:1 contra cores adjacentes. [7] | Linhas de gráfico, foco, borda funcional, ícone e seleção receberão espessura e contraste suficientes. | A avaliação de cada gráfico depende de quais marcas são essenciais para compreendê-lo. |
| Material Design, *Top Tips for Data Accessibility* | Recomenda comparações na mesma escala, resumo contextual atualizado por filtros, controles inclusivos e ligação ao dado subjacente/tabela acessível. [8] | Painéis terão período, metodologia/fonte, filtros compreensíveis, tabela de apoio e exportação controlada por permissão. | Guia de fornecedor; deve ser combinado com WCAG e teste de usabilidade. |

## Decisões provisórias adicionais

4. **A paleta será semântica e com redundância.** Positivo, atenção, crítico, informativo e neutro não dependem apenas de matiz; incluem rótulo, ícone e posição consistente.
5. **O gráfico é uma porta para o dado.** Filtro, tabela acessível, explicação de unidade/período e caminho de drill-down são partes do componente, não recursos opcionais.
6. **Densidade é uma preferência operacional.** O CRM deverá suportar pelo menos leitura confortável e compacta, preservando foco, contraste e área de toque.

## Captura 03 — padrões de CRM e sistema de cor

| Fonte | Achado verificável | Impacto para o CRM | Limitação |
| --- | --- | --- |
| Salesforce Lightning Design System, *Data Table* | Tabelas servem a grandes conjuntos relacionados e devem priorizar ordenação, filtro, desempenho incremental, ações por linha e edição pontual; em telas pequenas, cards/listas são preferíveis. [9] | Carteiras, recebíveis, estoque e pendências usarão tabela com vistas salvas, filtros e ações progressivas; o mobile reduzirá a composição para lista/tile orientada por tarefa. | É orientação do ecossistema Salesforce; a tabela não resolve por si só arquitetura de informação. |
| Salesforce Lightning Design System, *Displaying Data* | Tabela/árvore atende densidade e hierarquia; tiles são adequados a listas curtas e espaço horizontal limitado; feeds explicam atividade cronológica. [10] | A entidade terá três modos coerentes: lista para comparar, detalhe para decidir e timeline para compreender a história. | O limiar de quantidade de itens é contextual e deve ser testado com usuários. |
| Atlassian Design System, *Data Visualization* | Tokens separam marca, neutro, categórico e severidade; um único destaque com dados neutros melhora foco; categorias devem ser limitadas e reforçadas por sinais além da cor. [11] | A paleta de gráficos terá cores de marca, neutro de contexto, categorias limitadas e estados de risco semânticos, todos definidos por tokens. | Padrões de cor são específicos do sistema Atlassian, não uma paleta universal. |
| HubSpot, *Dashboard & Reporting Software* | A comunicação pública prioriza dashboards por função, editor de layout, permissões granulares e compartilhamento/agendamento de relatórios. [12] | Painéis do CRM serão por papel e objetivo, com filtros salvos, acesso controlado e exportação/compartilhamento com evidência de recorte. | Página de fornecedor descreve oferta comercial, não avalia sua eficácia comparativa. |

## Decisões provisórias adicionais

7. **A tela não será uma escolha única de layout.** Cada domínio terá lista, detalhe e atividade como vistas complementares, mantendo filtros e contexto ao trocar de vista.
8. **Gráfico e tabela atuarão em dupla.** O gráfico destaca padrão; a tabela permite verificar, ordenar, exportar e abrir casos reais sem perder o recorte aplicado.
9. **Personalização terá governança.** Usuários poderão salvar vistas e densidade, enquanto fórmulas, fonte, permissão e definição dos indicadores permanecem rastreáveis.

## Captura 04 — psicologia de cores sem simplificação

| Fonte | Achado verificável | Impacto para o CRM | Limitação |
| --- | --- | --- | --- |
| Elliot, *Color and psychological functioning* | A revisão apresenta a teoria de cor-no-contexto e recomenda prudência: efeitos dependem de tarefa, cultura, combinação de matiz/luminosidade/saturação e condições de visualização. [13] | “Azul transmite confiança” ou “vermelho gera urgência” não serão tratados como leis. A paleta será escolhida por semântica, contraste, marca e teste com usuários brasileiros. | Revisão de 2015; reconhece uma literatura ainda em desenvolvimento e heterogênea. |
| Hawlitschek et al., *Colors and Trust* | Em experimento de laboratório, interface vermelha elevou reciprocidade por calor percebido em um jogo de confiança; o próprio estudo recomenda investigação adicional. [14] | Fundos quentes podem ser usados com parcimônia em áreas de acolhimento/atenção, mas não como mecanismo supostamente garantido de persuasão. | Amostra de 92 participantes, cenário experimental específico e efeito não generalizável automaticamente a CRM imobiliário. |

## Decisões provisórias adicionais

10. **Psicologia das cores vira hipótese a validar, não promessa de conversão.** A primeira impressão será ancorada em clareza, consistência, contraste, velocidade e evidência — dimensões controláveis do produto.
11. **Azul cadastral, argila e verde serão funções, não adjetivos.** Azul ancora navegação e informação estável; argila chama decisão/atenção; verde sustenta confirmação/governança; o seu uso sempre depende de contexto, rótulo e contraste.

## Captura 05 — tipografia, layout e movimento

| Fonte | Achado verificável | Impacto para o CRM | Limitação |
| --- | --- | --- | --- |
| Material Design 3, *Typography* | Papéis tipográficos separam display, headline, title, label e body; texto corrido pede fonte legível; números tabulares ajudam escaneamento quando valores mudam. [15] | Fraunces fica restrita a marcos editoriais; DM Sans/sans de interface domina operação; valores, percentuais, datas e colunas usam figuras tabulares. | Guia multiplataforma; a escala final depende de idioma, dados e dispositivos do CRM. |
| Fluent 2, *Typography* | Uma rampa de tipos e alinhamento consistente produzem hierarquia escaneável; corpo e legenda têm escalas próprias. [16] | O produto terá tokens semânticos por papel, não tamanhos arbitrários por tela; rótulos pequenos não carregarão informação crítica isolada. | Tokens e fonte de referência são específicos do Fluent. |
| Fluent 2, *Motion* | Movimento deve ser funcional, natural, consistente e breve; transições orientam mudança, foco e hierarquia; movimento fora do elemento em foco pode distrair. [17] | Filtros, drill-down, abas e ações terão transições curtas e reversíveis; números não “contarão” sem necessidade e falhas não serão escondidas por animação. | Princípios de sistema de design, não uma medição empírica específica do setor imobiliário. |
| W3C WAI, técnica C39 | `prefers-reduced-motion` permite suprimir movimento acionado por interação para respeitar a preferência do usuário. [18] | Toda animação não essencial será protegida por redução de movimento desde a implementação inicial. | Técnica suficiente exemplificativa, não substitui a avaliação de acessibilidade integral. |

## Decisões provisórias adicionais

12. **Dois regimes tipográficos, um único ritmo.** Editorial para comunicar estratégia e decisão; interface neutra, compacta e tabular para trabalho recorrente.
13. **Movimento informa mudança de estado, não enfeita espera.** Entrada, seleção, painel lateral e drill-down podem animar; ações de teclado, alerta crítico e confirmação financeira devem ser imediatos e inequívocos.
14. **A superfície de trabalho privilegia persistência de contexto.** Filtro, período, recorte, caminho de retorno e dono do indicador continuam visíveis ao abrir detalhe ou lista.

## Captura 06 — IA visível, verificável e controlável

| Fonte | Achado verificável | Impacto para o CRM | Limitação |
| --- | --- | --- | --- |
| Salesforce Lightning Design System, *Agentic Patterns* | Cards de IA devem manter-se escaneáveis, mostrar fontes e feedback; painéis assistentes não devem atualizar dados sem consentimento; alterações pendentes devem ser distintas e confirmáveis. [19] | Uma recomendação de carteira, preço, prioridade ou documento mostrará fontes, recorte e comando explícito de aplicar/rejeitar/editar. | É padrão de fornecedor; políticas e limites próprios do CRM ainda precisam ser definidos. |
| Fluent 2, *Responsible AI* | Transparência, expectativa adequada, prevenção de dependência excessiva, controle e feedback estruturam a IA responsável; explicação e verificação devem estar disponíveis. [20] | A IA terá etiqueta, escopo de dados, limitação, painel de evidências, opção de revisão e trilha de aprovação — especialmente em crédito, compliance, financeiro e loteadora. | Guia de design com rubrica própria, não uma certificação regulatória brasileira. |
| Google PAIR, *People + AI Guidebook* | IA centrada em pessoas exige alinhar autonomia à tarefa, calibrar confiança por explicação, construir controles/feedback e tratar falhas de modo gracioso. [21] | Automação será graduada: sugerir → preparar → aguardar aprovação → executar em parceiro habilitado, conforme risco e permissão. | Guia prático de princípios; não substitui testes com os operadores reais. |

## Decisões provisórias adicionais

15. **IA não será uma mancha brilhante no painel.** Ela aparece como recomendação contextual que pode ser aberta, checada, corrigida, ignorada ou encaminhada; nunca como “verdade” visualmente indistinta do dado de origem.
16. **Todo insight de IA terá cartão de proveniência.** Fonte, momento de atualização, recorte, permissão, limitação, autoria técnica e ação humana posterior fazem parte do layout.

## Inspeção visual de referências públicas

| Referência | Observação visual | Tradução para o CRM imobiliário |
| --- | --- | --- |
| Salesforce Lightning Design System, tabela | A página não renderizou a demonstração no navegador de pesquisa, mas a documentação confirma uma estrutura centrada em cabeçalho, linhas escaneáveis, estados de linha/célula e ações progressivas. | Validar em protótipo a hierarquia de coluna fixa, totalização, seleção, dirty state e exceção por linha, sem converter a carteira em planilha infinita. |
| HubSpot, dashboard e reporting | A apresentação pública combina uma visão compacta de gráfico/tabela com texto de objetivo, CTA destacado e linguagem de dashboard por função; oferece opção de alto contraste no cabeçalho. | Cada painel do CRM deve abrir com pergunta de negócio, sinal numérico, gráfico/tabela complementar e caminho de ação, mantendo modo de alto contraste como requisito a avaliar. |

## Referências

[1] [Nielsen Norman Group — Dashboards: Making Charts and Graphs Easier to Understand](https://www.nngroup.com/articles/dashboards-preattentive/)

[2] [Nielsen Norman Group — Choosing Chart Types: Consider Context](https://www.nngroup.com/articles/choosing-chart-types/)

[3] [IBM Carbon — Chart types](https://carbondesignsystem.com/data-visualization/chart-types/)

[4] [IBM Carbon — Chart anatomy](https://carbondesignsystem.com/data-visualization/chart-anatomy/)

[5] [W3C WAI — Understanding SC 1.4.1: Use of Color](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)

[6] [W3C WAI — Understanding SC 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)

[7] [W3C WAI — Understanding SC 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)

[8] [Material Design — Top Tips for Data Accessibility](https://m3.material.io/blog/data-visualization-accessibility)

[9] [Salesforce Lightning Design System — Data Table](https://www.lightningdesignsystem.com/2e1ef8501/p/86f13a-data-table)

[10] [Salesforce Lightning Design System — Displaying Data](https://www.lightningdesignsystem.com/2e1ef8501/p/7540d0-displaying-data)

[11] [Atlassian Design System — Data Visualization](https://atlassian.design/foundations/color-new/data-visualization-color)

[12] [HubSpot — Dashboard & Reporting Software](https://www.hubspot.com/products/reporting-dashboards)

[13] [Elliot (2015) — Color and psychological functioning: a review of theoretical and empirical work](https://pmc.ncbi.nlm.nih.gov/articles/PMC4383146/)

[14] [Hawlitschek et al. (2016) — Colors and Trust: The Influence of User Interface Design on Trust and Reciprocity](https://www.computer.org/csdl/proceedings-article/hicss/2016/5670a590/12OmNs0C9RK)

[15] [Material Design 3 — Typography](https://m3.material.io/styles/typography/applying-type)

[16] [Fluent 2 — Typography](https://fluent2.microsoft.design/typography)

[17] [Fluent 2 — Motion](https://fluent2.microsoft.design/motion)

[18] [W3C WAI — Technique C39: prefers-reduced-motion](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)

[19] [Salesforce Lightning Design System — Agentic Patterns](https://www.lightningdesignsystem.com/2e1ef8501/p/03c548)

[20] [Fluent 2 — Responsible AI](https://fluent2.microsoft.design/responsible-AI)

[21] [Google PAIR — People + AI Guidebook](https://pair.withgoogle.com/guidebook/)
