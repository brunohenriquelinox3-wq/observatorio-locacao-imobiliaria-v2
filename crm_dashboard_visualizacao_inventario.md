# Inventário — visualização de dados, gráficos e dashboards para CRM

**Estado:** `hipóteses_em_auditoria`  
**Entradas:** curso atualizado de visualização/dashboards e `referencia-dashboard-moderno(1).html`, ambos fornecidos pelo usuário.  
**Regra de leitura:** o curso estabelece hipóteses de UX, análise e implementação. Ele não define métricas canônicas, autorização de leitura, verdade financeira, regra fiscal, disponibilidade de lote ou estado de contrato.

## 1. Padrões recebidos que merecem promoção condicional

| Código | Padrão recebido | Valor candidato para o CRM | Limite inicial |
| --- | --- | --- | --- |
| DASH-01 | Separar dashboard operacional, analítico e estratégico por pergunta/horizonte. | Evita painel genérico que mistura alerta de hoje, análise de mês e meta anual. | O mesmo dado pode aparecer em mais de uma lente, mas com definição, recorte e atualização explícitos. |
| DASH-02 | Dashboard por papel: gestão, comercial e financeiro/contábil. | Melhora relevância e reduz carga cognitiva por jornada. | Papel de UX não concede acesso; filtros, cards, exportação e drill-down permanecem sujeitos a escopo/policy. |
| DASH-03 | Escolher gráfico por intenção: comparação, tendência, composição, distribuição, relação e fluxo. | Direciona a visualização para a pergunta e reduz “chartjunk”. | Tipo de gráfico não corrige métrica sem denominador, período, estado, fonte ou comparabilidade. |
| DASH-04 | KPI com valor, comparação, delta semântico e sparkline. | Faz o indicador dizer o que mudou e por que a pessoa deve investigar. | Delta não é bom/ruim por subir/descer; exige polaridade e meta configuradas pelo owner da métrica. |
| DASH-05 | Funil com volume, conversão total e etapa-a-etapa. | Expõe perda acionável entre estados comerciais bem definidos. | Não usar funil para pipeline não sequencial, estágios sobrepostos ou coortes/denominadores incompatíveis. |
| DASH-06 | Filtros globais, filtro local, drill-down, cross-filter e exportação. | Permite investigação sem uma tela nova para cada recorte. | Todo recorte, dado derivado e exportação preserva policy, finalidade, escopo, auditoria e URL/estado reproduzível. |
| DASH-07 | Contraste, cor+forma, texto alternativo, tabela equivalente e movimento reduzido. | Faz o dado permanecer interpretável em leitor de tela, toque, zoom e baixa visão. | SVG bonito sem alternativa, foco ou semântica continua inacessível. |
| DASH-08 | Server aggregation e tecnologia proporcional a volume/interação. | Impede que navegador seja usado para somar dados sensíveis/volumosos e permite performance controlada. | Biblioteca é decisão de implantação; precisa de versão, bundle, acessibilidade, licença e teste no contexto do projeto. |

## 2. Contrato mínimo de uma métrica governada

Um card, gráfico, exportação ou alerta somente pode representar métrica operacional quando possui contrato legível. Isso protege o usuário contra números verdadeiros porém incomparáveis, números atualizados fora do período ou números que expõem dado fora de escopo.

| Campo obrigatório | Pergunta respondida | Exemplo de risco se ausente |
| --- | --- | --- |
| Identidade/nome da métrica | O que exatamente está sendo medido? | “Receita” mistura receita própria, repasse de terceiro, entrada e caixa. |
| Definição/fórmula/denominador | Como o número é calculado? | Inadimplência muda porque o denominador inclui carteira cedida ou acordo sem aviso. |
| Unidade e polaridade | R$, %, dias, quantidade; aumentar é bom, ruim ou neutro? | Delta verde sugere melhora quando atraso cresceu. |
| Janela/competência/fuso | Qual período, timezone, evento e corte temporal? | “Mês” mistura competência, caixa e data de atualização. |
| Escopo e filtros aplicados | Para quais organização, SPE, carteira, origem, canal e papéis? | Gestão compara empreendimentos com políticas/estoques incompatíveis. |
| Fonte, atualização e frescor | De onde veio, quando atualizou e com que atraso? | Callback pendente aparece como caixa confirmado ou “tempo real”. |
| Inclusões/exclusões/estado | Quais contratos, distratos, reservas, reversões ou exceções entram? | VGV, estoque e receita são inferidos da mesma coluna. |
| Owner, limitação e ação | Quem responde pela definição e qual decisão pode ser tomada? | Visual de vaidade vira meta, alerta ou promessa comercial. |
| Policy e exportação | Quem pode ver, detalhar, cruzar, baixar e compartilhar? | Cross-filter expõe carteira, saldo ou existência de objeto fora do escopo. |

## 3. Acertos observados no HTML de referência

| Área | Evidência no material | Decisão candidata |
| --- | --- | --- |
| Composição | Grid refluído de quatro KPIs para duas/uma coluna; tendência ocupa largura maior; cartões têm títulos e caps. | Manter hierarquia de resumo → tendência/composição → detalhe, sem “empilhar tudo” na primeira dobra. |
| KPI | Número tabular, valor contextual, delta com polaridade de negócio e sparkline. | Adotar card somente com comparação declarada e sem usar cor como único sinal. |
| Gráficos | Linha/área, barras com origem zero, donut de três categorias e funil com conversão etapa-a-etapa. | Usar a gramática como ponto de partida, deixando o contrato de métrica decidir se o gráfico é aplicável. |
| Responsividade/movimento | Grid reduz colunas e respeita `prefers-reduced-motion`. | Aplicar tokens e reflow antes de adicionar gráficos densos a móvel. |
| Transparência didática | Referência declara que os dados são fictícios. | Toda superfície do observatório e protótipo mantém estado de demonstração/produção inequívoco. |

## 4. Conflitos e lacunas que impedem cópia direta

| Código | Achado | Consequência para CRM |
| --- | --- | --- |
| DASH-GAP-01 | Séries, valores e labels são fictícios e gerados no cliente. | Não existe fonte, frescor, escala, tenant, definição ou evidência para promover como indicador real. |
| DASH-GAP-02 | `innerHTML` interpola labels e valores nos KPIs, gráfico, donut e funil. | Dado real precisa de renderização segura/escapada; não aceitar conteúdo de origem, corretor ou empreendimento como HTML. |
| DASH-GAP-03 | Tooltip de tendência opera apenas por `mousemove`; área hit não é focável nem expõe resumo alternativo. | Exige foco, toque, tabela/descrição equivalente e mecanismo não dependente de hover. |
| DASH-GAP-04 | Botões de intervalo mostram classe visual ativa, sem estado ARIA/descrição da atualização ou URL reproduzível. | Filtro precisa expor estado, preservar recorte, anunciar atualização e ser restaurável/compartilhável conforme policy. |
| DASH-GAP-05 | Donut, barras e funil são somente SVG visual, sem estrutura de dados equivalente. | Leitor de tela e exportação precisam de resumo, tabela acessível e ligação à definição da métrica. |
| DASH-GAP-06 | “Receita”, “inadimplência”, “estoque” e “conversão” aparecem como rótulos de exemplo sem regra de negócio. | No CRM, receita própria, valor de terceiro, settlement, carteira, VGV, reserva e estado de lote não podem compartilhar semântica. |
| DASH-GAP-07 | Troca de período redesenha todos os dados em memória. | Em produto real, filtros precisam de contrato server-side, autorização, agregação, cancelamento, erro/frescor e correlação. |
| DASH-GAP-08 | “Tempo real” e exportação são citados como capacidades, sem política de atraso, event ordering ou governança de download. | Tempo real exige limite de frescor e reconciliação; exportação precisa de permissão, watermark/lote, audit event e retenção. |

## 5. Invariantes candidatos a teste futuro

| Invariante | Tentativa de falha |
| --- | --- |
| Um KPI não renderiza sem definição, período, escopo, fonte e `as_of`. | Simular retorno parcial/fresco vencido e confirmar estado de incerteza, não valor verde. |
| Um funil só aceita etapas ordenadas, mutuamente interpretáveis e denominadores documentados. | Misturar status paralelos, remover etapa ou comparar coortes distintas; o visual deve recusar/explicar. |
| Gráfico tem alternativa textual/tabela e interação por teclado/toque quando aplicável. | Desligar cor, usar leitor de tela, Tab, zoom e sem mouse; resumo e dado exato permanecem alcançáveis. |
| Cross-filter e exportação não ampliam o escopo da identidade. | Forçar ID/URL/filtro de outra organização, SPE, carteira ou corretor; policy recusa e audita. |
| Um número de “caixa”, “receita”, “VGV” ou “repasse” traz natureza econômica visível. | Trocar evento de settlement, previsão, valor de terceiro e receita própria; rótulo/definição não podem permanecer iguais. |

## 6. Próximo confronto

O próximo ciclo confrontará as hipóteses de escolha de gráfico, acessibilidade, filtro/estado e métrica com fontes prioritárias de W3C/WCAG e evidências de engenharia/observabilidade já adotadas pela estratégia. A auditoria não usará o curso para fixar limite universal de cards, fatias, pontos SVG ou bibliotecas sem verificação contextual.
