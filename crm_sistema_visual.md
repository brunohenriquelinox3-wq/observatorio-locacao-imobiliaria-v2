# Sistema visual do CRM imobiliário

## Versão 0.1 — interface como infraestrutura de decisão

O futuro CRM não deve competir por excesso de brilho, cards ou gráficos circulares. A sua primeira impressão precisa transmitir **controle, clareza e profundidade operacional**: uma imobiliária deve enxergar a próxima ação; uma loteadora, o estado real do lote e da carteira; a controladoria, a origem de uma diferença; e o contador, a evidência necessária para fechar. Esta proposta mantém a identidade **Caderno de Campo Urbano** para a camada estratégica, mas traduz o produto operacional para uma superfície mais compacta, responsiva e segura.

> **Princípio central:** o visual é excelente quando uma pessoa encontra a exceção, entende o motivo, abre o caso certo e sabe qual ação pode executar — sem perder o recorte, a permissão ou a origem do número.

## 1. O que é “moderno” em CRM — e o que não é

A modernidade relevante em CRM não é um degradê, uma animação longa ou uma parede de KPIs. É a combinação de **contexto persistente**, personalização governada, interfaces com densidade regulável, gráficos que abrem o dado, busca rápida, estados explícitos e inteligência artificial verificável. Dashboards destinam-se a uma visão de ação rápida, e não a uma exploração ilimitada; por isso, precisam comunicar a pergunta essencial antes de oferecer filtros ou efeitos. [1] 

| Adoção | Motivo | Antipadrão a evitar |
| --- | --- | --- |
| Um “cockpit” por função | Diretor, corretor, coordenador, loteadora e contador observam perguntas diferentes. | Um painel universal com dezenas de cards iguais para todos. |
| Lista → detalhe → atividade | A lista compara; o detalhe explica; a linha do tempo preserva decisões e autoria. [9] [10] | Mandar o usuário a páginas sem retorno de filtro ou contexto. |
| Gráfico + tabela de apoio | O gráfico revela padrão; a tabela permite verificar, ordenar, exportar e abrir o caso. [8] | Um gráfico bonito que não permita chegar ao dado de origem. |
| Densidade como preferência | Campo e controladoria exigem ritmos de leitura distintos. | Obrigar todos a uma tela “arejada” ou compacta demais. |
| IA com proveniência | Fonte, data, escopo, permissão, limitação e confirmação humana formam confiança. [19] [20] | Resposta de IA visualmente confundida com fato ou alteração silenciosa. |

## 2. Arquitetura de informação para uma superfície de trabalho

O CRM operacional utilizará um **shell persistente**. À esquerda, uma navegação curta por objetos e filas; ao centro, uma superfície de trabalho; à direita, um painel contextual opcional para detalhe, explicação, tarefa ou assistente. A parte superior não será uma barra decorativa: exibirá organização/SPE, recorte temporal, pesquisa global, indicadores de sincronização e identidade do usuário. Isso evita que filtros, empresa, período e permissão desapareçam quando alguém investiga uma anomalia.

| Camada | Papel | Componentes principais |
| --- | --- | --- |
| Navegação | Trocar de território de trabalho sem desorientação. | Visão geral, relações, ativos, estoque, propostas, carteira, financeiro, evidências, relatórios. |
| Barra de contexto | Explicitar “onde”, “para quem” e “em qual recorte” se está operando. | Workspace/SPE, período, vista salva, busca, estado de atualização, exportar/compartilhar. |
| Superfície principal | Ler, comparar e agir. | KPIs explicativos, gráfico, tabela/lista, mapa, funil, painel de exceção. |
| Painel contextual | Investigar sem trocar de tela. | Detalhe rápido, filtros, histórico, justificativa de IA, ações aprováveis. |
| Linha de evidência | Separar fato, interpretação, decisão e execução. | Fonte, autor, data/hora, versão, regra, aprovação, referência de integração. |

Em telas largas, esta estrutura pode manter a navegação e o contexto visíveis. Em telas menores, a navegação migra para drawer, a tabela colapsa para lista de campo e o painel contextual vira sheet, preservando apenas as informações necessárias à tarefa. Tabelas devem ceder lugar a tiles/listas em pouco espaço horizontal, enquanto feeds servem à cronologia de atividades. [9] [10]

## 3. Catálogo de gráficos por pergunta operacional

A escolha não começa pelo componente; começa pela decisão. Barras, linhas e dispersão favorecem comparações que dependem de comprimento e posição, que são percebidos com mais precisão do que ângulo e área. [1] [2] O CRM terá um **catálogo de perguntas**, no qual cada visualização declara período, unidade, fonte, critério de inclusão, atualização e caminho de drill-down.

| Pergunta de CRM | Visual principal | Complemento obrigatório | Interação útil | Limite de uso |
| --- | --- | --- | --- | --- |
| Onde está a exceção que exige ação? | Barra horizontal ordenada ou tabela ordenável. | Meta/limiar, dono, data e link para casos. | Clique filtra a fila. | Nunca usar pizza para priorizar exceções. |
| O indicador está melhorando ou piorando? | Linha com marcadores de coleta. | Período anterior/meta, anotação de eventos e tabela de valores. | Trocar período, comparar recortes. | Não conectar pontos sem continuidade temporal justificável. |
| Qual é a composição de uma carteira? | Barra empilhada limitada ou barras separadas. | Valores absolutos, porcentagem, legenda/rótulos diretos. | Isolar componente e abrir casos. | Evitar muitas séries; segmentos intermediários de empilhada não são bons para comparação. [2] |
| Qual equipe/empreendimento/etapa compara melhor? | Barras agrupadas ou pequenos múltiplos. | Mesmo eixo, período e definição. | Ordenar por delta, meta ou valor. | Não mudar escala entre pares comparáveis. |
| Há relação entre preço, prazo, conversão ou inadimplência? | Dispersão com linha/meta opcional. | Rótulo para outlier, tamanho/forma explicados e tabela. | Selecionar região de interesse. | Não sugerir causalidade apenas por correlação. |
| Como o funil evolui? | Etapas horizontais com taxa e perda por transição. | Coorte, período, definição de etapa e lista de perdas. | Filtrar dono/canal/empreendimento. | Não usar “funil” sem estados mutuamente compreensíveis. |
| Como o estoque de lote se distribui no território? | Planta/quadra/lote interativa ou mapa temático, não um gráfico genérico. | Legenda, estado comercial, restrição, última atualização e tabela. | Hover/foco abre lote; filtro por fase/quadra. | Separar disponibilidade, alocação, registro e carteira. |
| Qual é o envelhecimento da carteira? | Barras por faixa de atraso ou heatmap de coorte. | Total, quantidade de contratos, política de cobrança e casos. | Abrir faixa e responsável. | Cor de severidade acompanhada de rótulo/ícone. |
| Como o caixa previsto se compara ao realizado? | Linha de realizado + projeção pontilhada/faixa de incerteza. | Premissas, origem, versão e tabela mensal. | Fixar cenário, trocar competência. | Não apresentar projeção como saldo conciliado. |
| Como direitos se distribuem por contrato? | Tabela hierárquica e waterfall explicável; Sankey apenas no modo de exploração. | Regra, base, recebedor, gatilho, prioridade, teto e status. | Expandir recebedor; abrir fórmula. | Nunca substituir a lista auditável por um diagrama. |
| Como um direito foi calculado? | Linha de eventos / waterfall linear. | Origem → base → regra → ajuste → aprovação → instrução → retorno. | Abrir evidência em cada etapa. | Não condensar fórmula financeira em card opaco. |

### 3.1 Regras de ouro para os gráficos

Todo gráfico deve possuir: título em forma de insight ou pergunta; unidade; período; fonte; recorte aplicado; definição de métrica; estado de carregamento, vazio, erro e desatualização; e alternativa de tabela acessível. O tooltip aprofunda um dado, mas não pode carregar a única informação essencial. Carbon recomenda títulos qualitativos, legenda que explique a codificação, rótulos diretos quando possível e eixos/grades que preservem escala. [4]

Pizza, donut, velocímetro, radar e 3D ficam fora do padrão de comparação. Podem existir como elementos secundários de parte-do-todo ou status singular, mas sempre acompanhados de total e tabela. Eles dependem de área ou ângulo, codificações menos precisas para comparação rápida. [1] [2]

## 4. Cores: semântica, contraste e marca

A pesquisa sobre cor recomenda prudência: associações emocionais dependem de contexto, cultura, tarefa, luminosidade e saturação; elas não são uma máquina universal de persuasão. [13] A paleta do CRM, portanto, não promete “vender mais por ser azul”. Ela usa cor para reforçar significado, delimitar hierarquia e criar reconhecimento sem esconder a informação em apenas um matiz.

| Família semântica | Papel visual no CRM | Aplicação | Regra de proteção |
| --- | --- | --- | --- |
| Azul cadastral `#173B4D` | Informação estrutural, navegação, confiança operacional. | Shell, links fortes, títulos de dado, foco em fundos claros. | Não usar como substituto de “positivo”. |
| Argila de decisão `#C65A35` | Atenção, ação pendente, chamada de investigação. | CTA primário pontual, recorte ativo, meta em risco, anotação. | Não sinaliza erro isoladamente; combinar com texto/ícone. |
| Verde de governança `#38503A` | Confirmação, conciliação, evidência revisada, estado apto. | Selo “revisado”, sucesso, integridade. | Não é “fim do processo” sem data e responsável. |
| Ouro de referência `#E0B18D` | Meta, referência secundária, assinatura editorial. | Linha de meta, eixo de destaque, label especial. | Nunca como texto pequeno em fundo claro sem validação. |
| Mineral `#F7F2E9` e cinzas neutros | Superfície de leitura, contenção e dados de contexto. | Fundo, tabela, estados inativos, dados não selecionados. | Bordas e texto devem permanecer perceptíveis. |
| Severidade | Informação, sucesso, atenção, perigo e neutro. | Alertas, atraso, erros, bloqueios, aprovações. | Cada estado combina cor, rótulo, ícone e, se necessário, padrão/forma. |

Texto normal deverá alcançar pelo menos **4,5:1** de contraste e texto grande, **3:1**, conforme WCAG; componentes e marcas gráficas essenciais também precisam de ao menos **3:1** contra cores adjacentes. [6] [7] A cor jamais será o único indicador de reserva bloqueada, parcela em atraso, divergência, alteração pendente ou alerta de compliance. [5]

Para séries quantitativas, uma cor de marca evidencia o foco e neutros deixam contexto em segundo plano. Categorias precisam de uma sequência curta, previsível e acompanhada de rótulo direto, forma ou textura quando necessário. Atlassian recomenda limitar categorias e não aplicar texto em cima de cores de chart quando a combinação não suporta contraste de texto. [11]

## 5. Tipografia e números

O observatório atual usa **Fraunces + DM Sans** como gesto editorial. No CRM operacional, a regra é: Fraunces para marcos escassos — título de dashboard, total estratégico e abertura de relatório — e DM Sans para navegação, campos, tabela, números e workflow. Essa divisão preserva personalidade na primeira impressão e eficiência na execução diária.

| Papel | Família | Faixa orientativa | Uso |
| --- | --- | --- | --- |
| Display estratégico | Fraunces | 32–48 px desktop; 28–36 px mobile | Um título de visão, nunca coluna de dados. |
| Headline de workspace | DM Sans semibold | 24–32 px | Nome de fila, empreendimento ou análise. |
| Título de painel | DM Sans semibold | 18–22 px | Seção, gráfico, modal e painel lateral. |
| Corpo | DM Sans regular | 14–16 px, line-height próximo de 1,5 | Explicação, comentário, evidência e ajuda. |
| Operacional | DM Sans medium/semibold | 12–14 px, line-height 1,35–1,45 | Tabela, filtro, status, botão e metadado. |
| Numérico | DM Sans com `font-variant-numeric: tabular-nums` | Conforme contexto | Valores monetários, percentuais, datas, parcelas e variações. |

Os papéis tipográficos — display, headline, title, body e label — evitam que toda tela use a mesma ênfase. Fontes decorativas não devem ser usadas no corpo, e números tabulares reduzem o deslocamento visual quando valores mudam. [15] Tipografia de operação privilegia alinhamento à esquerda para texto longo, sentence case e rampa semântica consistente. [16]

## 6. Layouts por trabalho, não por moda

### 6.1 Painel de decisão

O painel começa com uma **faixa de decisão**: pergunta, período, recorte, atualização, métrica central, delta contextual e ação recomendada. Abaixo, no máximo três sinais de primeira leitura e um gráfico principal; depois, a fila de casos. A tela não é uma vitrine de KPIs. É uma forma de responder “onde devo agir agora?”.

### 6.2 Fila operacional

Uma fila é uma tabela/lista com visão salva, filtro explícito, ordenação compreensível, contagem, bulk action com alçada e preview de registro. Campos editáveis são poucos e próximos do uso frequente; alterações pendentes recebem dirty state, validação e confirmação. Essas práticas são coerentes com a orientação do Lightning para tabela, filtragem, ações em linha e edição apenas quando a frequência justifica. [9]

### 6.3 Dossiê de parte, ativo ou contrato

O detalhe tem uma “faixa de identidade” fixa com estado, dono, próxima ação e permissões. Abaixo, abas ou blocos ordenados por uso: resumo, relação/partes, proposta/contrato, documentos/evidências, financeiro/carteira e timeline. O usuário não navega por dezenas de campos; ele progride por uma narrativa rastreável.

### 6.4 Loteadora

O layout de loteadora é composto por uma planta explorável ou grade territorial, uma legenda de estados paralelos e uma coluna de exceções. A planta abre o lote; o lote abre os vínculos de empreendimento, fase, alocação, reserva, contrato, parcela e restrição. Disponibilidade comercial não deve suprimir bloqueio registral, alocação de permutante ou carteira ativa.

### 6.5 Financeiro e contador

O workspace financeiro mostra competência, empresa/SPE, saldo explicado, reconciliações e divergências. O contador recebe uma visão comparativa entre evento, documento, retorno, lançamento/exportação e exceção; não um feed de cards sem origem. O dado fiscal/contábil deve sempre reabrir o evento de origem, e toda exportação precisa de versão, lote e retorno.

## 7. Interações leves, fluidas e seguras

Movimento serve para explicar relacionamento, mudança de estado e destino de uma ação; não para ocupar a atenção. Fluent recomenda transições funcionais, naturais, consistentes, rápidas e confinadas ao elemento em foco. [17]

| Situação | Tratamento | Duração orientativa | Acessibilidade e segurança |
| --- | --- | --- | --- |
| Hover em gráfico | Destaca marca, mostra tooltip e reduz contexto de forma sutil. | 120–160 ms | Também deve funcionar por foco de teclado e tabela. |
| Filtro aplicado | Atualiza a faixa de recorte, preserva o estado anterior e anuncia resultado. | 160–220 ms | Não ocultar recorte; anunciar mudança relevante. |
| Abrir detalhe lateral | Painel entra do lado relacionado ao item, mantendo a lista visível. | 180–240 ms | `Esc` fecha; foco retorna ao item de origem. |
| Trocar aba | Troca de conteúdo com fade curto, sem deslocar a página. | 120–180 ms | Ativação por teclado é imediata. |
| Salvar edição | Estado pending → confirmado/erro com mensagem explicativa. | 0–160 ms | Alteração financeira, fiscal ou contratual requer confirmação, não celebração visual. |
| Carregamento | Skeleton com dimensões reais do conteúdo e texto de estado quando demorar. | Sem loop chamativo | Nunca transformar atraso de integração em falsa conclusão. |

O CSS será estático por padrão e ativará animações não essenciais apenas em `prefers-reduced-motion: no-preference`; essa estratégia respeita a preferência de redução de movimento prevista pelo W3C. [18] Nenhuma informação indispensável deve existir apenas em transição, hover ou animação.

## 8. IA como camada explicável de interface

Uma IA moderna em CRM precisa ser mais discreta do que um chatbot onipresente. Cada entrada terá ícone/etiqueta de IA, escopo de dados usado, fontes, data, limitações, controles de ajustar/recusar e log de aprovação. A recomendação não altera cadastro, contrato, reserva, cálculo, direito econômico ou instrução de pagamento sem consentimento explícito e alçada. [19] [20]

| Tipo de contribuição | Forma visual | Controle humano |
| --- | --- | --- |
| Resumo de carteira | Card com fontes, recorte e evidências expansíveis. | Editar, marcar impreciso, abrir fonte. |
| Priorização de follow-up | Lista proposta com motivos e dados de entrada. | Aceitar por item, alterar regra, ignorar, registrar motivo. |
| Pré-preenchimento | Campo marcado como sugestão pendente. | Revisar, editar, desfazer e confirmar. |
| Investigação de divergência | Painel de hipóteses com links a eventos. | Confirmar hipótese, abrir caso, encaminhar ao responsável. |
| Geração de relatório | Canvas exportável com parâmetros e fontes. | Ajustar filtros, revisar texto e aprovar compartilhamento. |

## 9. Estados que fazem o produto parecer confiável

O visual mais profissional é aquele que não finge certeza. Todo componente de dados e workflow terá estados explícitos: carregando, sem dado, sem permissão, parcial, desatualizado, divergente, em revisão, bloqueado, aprovado, revertido e erro recuperável. O usuário deve saber se “zero” representa nenhuma ocorrência, uma falha de sincronização ou a ausência de acesso.

## 10. Métricas para validar a experiência

O sistema visual será testado em fluxos reais de imobiliária, loteadora e controladoria. A validação não se resume a preferência estética.

| Hipótese de qualidade | Medida observável | Meta de piloto |
| --- | --- | --- |
| O painel revela prioridade. | Tempo para identificar a primeira exceção e abrir o caso correto. | Redução frente à planilha/processo atual. |
| O gráfico não mascara o dado. | Taxa de acerto ao explicar período, unidade, fonte e recorte. | Alta compreensão sem intervenção. |
| A densidade respeita a função. | Alternância de modo e abandono de tarefa por perfil. | Corretor e controladoria encontram modo adequado. |
| A cor não exclui. | Avaliação de contraste, modo alto contraste e teste de distinção sem cor. | Todos os estados críticos reconhecidos sem depender de matiz. |
| A IA é calibrada. | Aceite, edição, rejeição e verificação de fonte por recomendação. | Uso consciente, sem aceite cego. |
| O produto preserva fluidez. | Tempo até conteúdo útil, resposta de filtro e queda de quadros em fluxos críticos. | Metas definidas por ambiente e dispositivo do piloto. |

## 11. Limites e protocolo de evolução

Não há fonte que prove uma combinação universal de cores, fonte ou layout vencedora. Práticas de design systems revelam padrões maduros, e pesquisas de percepção orientam escolhas, mas a eficácia precisa ser confirmada com dados, contexto e operadores brasileiros. A cada iteração, a equipe registrará hipótese, mockup/protótipo, usuário/role, tarefa, evidência, resultado, decisão, versão e impacto na biblioteca.

As conclusões visuais que afetarem precificação, risco, crédito, contrato, tributação, contabilidade, pagamento ou compliance continuam sujeitas a validação humana pelos responsáveis habilitados. O CRM deve **explicar e organizar**; não fingir que um gráfico ou recomendação substitui julgamento profissional.

## Referências

[1] [Nielsen Norman Group — Dashboards: Making Charts and Graphs Easier to Understand](https://www.nngroup.com/articles/dashboards-preattentive/)

[2] [Nielsen Norman Group — Choosing Chart Types: Consider Context](https://www.nngroup.com/articles/choosing-chart-types/)

[4] [IBM Carbon — Chart anatomy](https://carbondesignsystem.com/data-visualization/chart-anatomy/)

[5] [W3C WAI — Understanding SC 1.4.1: Use of Color](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)

[6] [W3C WAI — Understanding SC 1.4.3: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)

[7] [W3C WAI — Understanding SC 1.4.11: Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)

[8] [Material Design — Top Tips for Data Accessibility](https://m3.material.io/blog/data-visualization-accessibility)

[9] [Salesforce Lightning Design System — Data Table](https://www.lightningdesignsystem.com/2e1ef8501/p/86f13a-data-table)

[10] [Salesforce Lightning Design System — Displaying Data](https://www.lightningdesignsystem.com/2e1ef8501/p/7540d0-displaying-data)

[11] [Atlassian Design System — Data Visualization](https://atlassian.design/foundations/color-new/data-visualization-color)

[13] [Elliot (2015) — Color and psychological functioning: a review of theoretical and empirical work](https://pmc.ncbi.nlm.nih.gov/articles/PMC4383146/)

[15] [Material Design 3 — Typography](https://m3.material.io/styles/typography/applying-type)

[16] [Fluent 2 — Typography](https://fluent2.microsoft.design/typography)

[17] [Fluent 2 — Motion](https://fluent2.microsoft.design/motion)

[18] [W3C WAI — Technique C39: prefers-reduced-motion](https://www.w3.org/WAI/WCAG22/Techniques/css/C39)

[19] [Salesforce Lightning Design System — Agentic Patterns](https://www.lightningdesignsystem.com/2e1ef8501/p/03c548)

[20] [Fluent 2 — Responsible AI](https://fluent2.microsoft.design/responsible-AI)

[21] [Google PAIR — People + AI Guidebook](https://pair.withgoogle.com/guidebook/)
