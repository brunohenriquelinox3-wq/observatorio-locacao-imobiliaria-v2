# Consolidação — dashboards, métricas e gráficos governados para CRM

**Estado:** `decisões_prontas_para_integração_documental`  
**Escopo:** dashboards operacional, analítico e estratégico; contratos de métrica; visualização, filtros, drill-down, exportação, acessibilidade e performance.  
**Fora de escopo:** ativar dado real, criar consultas, ligar tempo real, exportar carteira, definir meta comercial/fiscal, escolher parceiro analítico ou publicar um painel operacional.

## Decisões promovidas

| Código | Decisão | Owner | Limite explícito | Impacto de produto |
| --- | --- | --- | --- | --- |
| VIZ-01 | Cada painel é definido por **papel + intenção + horizonte**: operacional (agir agora), analítico (explicar) ou estratégico (acompanhar direção). | Produto + owner operacional. | Um painel não acumula as três intenções sem separar lentes e recortes. | `DashboardDefinition` declara audiência, pergunta, prioridade, contexto padrão e ações autorizadas. |
| VIZ-02 | Cada número visualizado nasce de `MetricDefinition` versionada. | Owner de métrica: comercial, controladoria, operação de loteadora, locação ou pesquisa. | Card sem fórmula, unidade, janela, escopo, fonte, frescor e limitação exibe estado “não definido”, não número. | Métrica carrega denominador, inclusões/exclusões, polaridade, meta/comparação, `as_of`, timezone, lineage, aprovação e política. |
| VIZ-03 | `DashboardQuery` é server-side, autorizada e reproduzível. | Arquitetura + segurança + domínio. | Filtro de UI não é autorização nem contrato de dado. | Contexto possui organização, SPE, carteira, período, timezone, dimensões, policy, versão e correlação. |
| VIZ-04 | Escolha de gráfico responde à intenção, não à moda: barra para comparação, linha/área para tempo, composição limitada para parte do todo, distribuição para faixa, funil para sequência, tabela para precisão. | Produto analítico + UX. | Nenhum tipo é obrigatório; visual só entra quando ajuda uma decisão e a métrica é comparável. | `VisualizationSpec` declara intenção, encoding, unidade, baseline, escala, série, acessibilidade e fallback de tabela. |
| VIZ-05 | Funil exige etapas ordenadas, definição de entrada/saída, coorte/janela, regra de reentrada e conversão etapa-a-etapa. | Comercial + produto. | Pipeline em snapshot, estados paralelos ou denominadores misturados não podem ser exibidos como funil de conversão. | O funil mostra volume, conversão do topo, conversão adjacente, abandono, recorte e link seguro para a lista que explica cada etapa. |
| VIZ-06 | Métrica financeira preserva natureza econômica e estado de prova. | Controladoria + financeiro + contador. | VGV, faturamento, caixa, recebível, repasse de terceiro, receita própria, previsão e settlement não compartilham rótulo nem série por conveniência. | Cards/linhas de carteira revelam competência/caixa, inclusão de reversão/distrato, aging, conciliação e fonte de confirmação. |
| VIZ-07 | Gráfico material possui resumo, alternativa estruturada e interação inclusiva. | UX + acessibilidade + frontend. | Tooltip, cor, hover ou SVG sozinho não é alternativa suficiente. | `ChartEvidence` reúne título, insight, tabela, unidade, escala, fonte, recorte, dados/descrição longa e estado vazio/erro. |
| VIZ-08 | Filtros, cross-filter, drill-down, exportação e “tempo real” são comandos governados. | Produto + segurança + dados. | Interação não amplia escopo, e “tempo real” não é sinônimo de dado confirmado. | Cada ação mantém policy, URL/estado reproduzível, audit event, frescor, cancelamento, erro e aviso de parcialidade. |
| VIZ-09 | Tecnologia é proporcional a volume e acessibilidade, não definida pelo curso. | Arquitetura + frontend. | Não fixar biblioteca, SVG/Canvas/WebGL ou limite de pontos sem perfil de carga, bundle, licença e teste. | Gráfico padrão pode reutilizar Recharts já instalado; grandes séries exigem agregação/downsampling server-side e decisão específica. |

## Contrato mínimo de métrica e visualização

| Bloco | Campos mínimos | Pergunta que evita |
| --- | --- | --- |
| `MetricDefinition` | ID, nome, owner, fórmula, unidade, denominador, polaridade, meta, janela, timezone, inclusões/exclusões, estados, versão. | “O que exatamente é receita, inadimplência, ocupação ou conversão?” |
| `MetricLineage` | fontes, eventos, transformação, schedule/frescor, `as_of`, confiança, limitação, aprovação e revisão. | “De onde veio, quando fechou e o que ainda pode mudar?” |
| `DashboardQuery` | papel, organização/SPE/carteira, filtros, policy, intervalo, correlação, limite/paginação e snapshot. | “Para quem, qual recorte e com que autorização?” |
| `VisualizationSpec` | intenção, gráfico, baseline/escala, séries, legenda, unidade/formato, ordem, comparação e fallback de tabela. | “Por que este gráfico, e ele pode induzir interpretação errada?” |
| `ChartEvidence` | título, insight, descrição curta/longa, tabela, fonte, recorte, atualização, vazio/erro e ação possível. | “Como uma pessoa sem cor, hover ou gráfico entende e investiga?” |

## Mapa de métricas por domínio

| Área | Pergunta legítima | Visual candidato | Gate de semântica |
| --- | --- | --- | --- |
| Comercial | Onde a coorte perde conversão entre lead, visita, proposta e fechamento? | Funil/barras de conversão + tabela de casos. | Etapas sequenciais, coorte, reentrada e owner comercial definidos. |
| Loteadora | Como estoque elegível se distribui entre disponível, reserva, contrato, alocação e restrição? | Barra empilhada/tabela de estados. | Estado projetado vem de registro, alocação, restrição e compromisso; não de label manual. |
| Carteira | Como aging e previsto/recebido evoluem sem confundir competência, caixa e settlement? | Barras por faixa + linha/área por natureza + tabela. | Contrato, parcela, evento, prova, conciliação, reversão e `as_of` explícitos. |
| Financeiro | Qual direito está provisionado, instruído, parcial, conciliado ou em exceção? | Fila/tabela e KPI de estado, não gauge simplista. | Entitlement, instrução, settlement e conciliação permanecem objetos distintos. |
| Locação | Quais contratos pedem renovação, quais repasses estão pendentes e qual ocupação é aplicável? | Lista priorizada + KPI/linha com definição. | Contrato, imóvel, período, garantia, repasse e escopo do administrador definidos. |
| Gestão estratégica | A meta está sendo perseguida por indicadores antecedente/consequente no recorte correto? | Poucos KPIs + tendência/nota de decisão. | Meta, baseline, período, owner e ação de revisão visíveis. |

## Critérios de aceite obrigatórios

| Jornada | Prova exigida | Resultado esperado |
| --- | --- | --- |
| KPI | Simular fonte atrasada, denominador zero, valor parcial, polaridade invertida e meta ausente. | Card expõe incerteza/limitação e nunca pinta crescimento como melhoria sem definição. |
| Funil | Reentrada, etapa pulada, coortes misturadas, etapas paralelas e lista detalhada. | Visual recusa/explica dado inválido; conversão só aparece com sequência e denominador compatíveis. |
| Financeiro | Trocar previsão, evento recebido, settlement, reversão e valor de terceiro. | Rótulo, natureza e estado mudam; caixa confirmado não é inferido de comprovante ou previsão. |
| Acessibilidade | Leitor de tela, Tab, toque, sem cor, alto contraste, zoom e movimento reduzido. | Resumo/tabela são alcançáveis; controle tem nome/foco; série/estado não depende só de cor. |
| Filtro/drill/export | Deep link, troca de organização/SPE, revogação, cancelamento e exportação. | Policy não amplia, recorte é reproduzível, ação é auditada e falha mostra estado seguro. |
| Desempenho | Grande volume, série longa, resposta parcial e cancelamento. | Agregação/limite são server-side; cliente não soma carteira crua nem congela para desenhar. |

## Decisões rejeitadas ou adiadas

| Atalho | Decisão | Razão |
| --- | --- | --- |
| “Cinco segundos” como SLA universal de compreensão. | Rejeitado como regra rígida. | É heurística de hierarquia; cada papel, tarefa, risco e dado exige validação por uso. |
| Dark mode, gradiente, gauge, donut ou sparkline como sinônimo de painel moderno. | Rejeitado como critério de qualidade. | Estilo não substitui métrica, acessibilidade, recorte, ação ou truthfulness. |
| Verde para subir e vermelho para cair em toda métrica. | Rejeitado. | Polaridade é de negócio; aumento de inadimplência, atraso ou risco pode ser negativo. |
| “Tempo real” para evento externo não conciliado. | Rejeitado. | A interface deve informar frescor, estado incerto, retorno e reconciliação. |
| Exportação de gráfico/CSV por visibilidade de card. | Adiado. | Exige policy, finalidade, watermark/lote, audit event, retenção e conteúdo permitido. |
| Biblioteca fixada pela recomendação de curso. | Adiado. | Projeto decide por jornada, bundle, licença, acessibilidade, volume, custo e prova de carga. |

## Referências

[1] [Evidências de visualização, acessibilidade e contraste](crm_dashboard_visualizacao_evidencias.md)

[2] [Inventário do curso e referência de dashboard](crm_dashboard_visualizacao_inventario.md)

[3] [Subledger da imobiliária](crm_subledger_imobiliaria.md)

[4] [Diretriz permanente de execução sem atalhos](crm_diretriz_execucao_sem_atalhos.md)
