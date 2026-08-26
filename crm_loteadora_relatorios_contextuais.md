# Loteadora: relatórios contextuais e consolidação executiva

**Status:** `decisão_aprovada_para_estratégia`  
**Decisão LOT-A07:** **Relatórios não será um setor próprio** na primeira versão da Loteadora. Cada setor entrega suas leituras, filas, filtros e ações explicáveis; o Painel Loteadora e o ADM consolidam apenas indicadores executivos definidos, sem duplicar carteira, estoque ou direito econômico.

> **Princípio:** um relatório deve começar na pergunta operacional e manter ligação com a lista/fato que explica o número. Uma tela genérica de “relatórios” não pode somar números de origens, estados e escopos incompatíveis.

## 1. Onde cada leitura vive

| Contexto | Perguntas que responde | Leituras contextuais | Ação permitida |
| --- | --- | --- | --- |
| **Painel Loteadora** | O que exige atenção transversal hoje? | Alertas de elegibilidade, reservas a vencer, contratos sem agenda, dossiês pendentes, carteira em risco, direitos bloqueados, conflitos lote × contrato e restrições técnicas. | Abrir o setor/caso fonte no escopo autorizado; não corrigir fato na tela executiva. |
| **Estoque/Mapa de Lotes** | Qual lote está elegível, reservado, contratado, alocado, restrito ou em conflito? | Mapa/espelho, composição de estoque por estado, restrições, lotes sem elegibilidade e alertas por `Qn · Ln`. | Investigar a ficha do lote ou iniciar transição comercial autorizada. |
| **Propostas, Reservas e Contratos** | Onde a jornada perde tempo ou cria risco de conversão? | Propostas por estado, reservas próximas do vencimento, conversão apenas quando coorte/etapas forem válidas, assinatura/dossiê/agenda pendentes e contratos realizados. | Abrir proposta, reserva, checklist ou contrato; não converter sem alçada/regra. |
| **Financeiro e Carteira** | Qual é a saúde da carteira e o que requer cobrança/conciliação? | Agenda prevista, cobrança, aging, acordos, comprovantes em análise, cash application, conciliação e exceções. | Abrir parcela/caso de carteira conforme papel; não tratar boleto como caixa. |
| **Repasses e Distribuição** | Qual direito está projetado, elegível, bloqueado, instruído, em conciliação ou compensado? | Fila de direitos por estado, plano/regra, recebedor/grupo, exceções, instruções e settlement. | Abrir entitlement/instrução/caso; não executar repasse fora de alçada/rota. |
| **Sócios e Parceiros** | Quais vínculos, grupos, aportes ou instrumentos exigem revisão? | Vigências, documentos, direitos bloqueados, cronogramas de aporte, escopos de grupo e pendências de prestação de contas. | Abrir vínculo/instrumento; painel externo permanece mínimo por finalidade. |

## 2. Contratos mínimos de métricas por contexto

| Métrica/contexto | Definição operacional resumida | Não confundir com | Linha de investigação |
| --- | --- | --- | --- |
| **Estoque elegível** | Lotes que atendem às políticas de registro/alocação/restrição/compromisso/tabela/alçada aplicáveis no `as_of`. | Lotes simplesmente “não vendidos”, VGV, reserva ou contrato. | Mapa de lotes, restrições, alocações e regra de elegibilidade. |
| **Reservas em risco** | Reservas ativas/próximas do vencimento ou expirada em análise, por prazo de servidor e regra vigente. | Vendas contratadas ou estoque livre. | Reserva, proposta, lote, alçada e motivo de exceção. |
| **Contratos com pendência** | Contratos com falha explícita de assinatura, dossiê, agenda, versão, cessão/distrato ou conflito de estoque. | Contratos rescindidos, adimplência financeira ou entrega. | Linha de contratos realizados por lote e checklist/carteira relacionados. |
| **Carteira por estado de prova** | Valores/parcelas segregados em previsto, cobrado, comprovante em análise, aplicado, conciliado, acordo e atraso. | Receita, caixa garantido, VGV, repasse ou settlement. | Parcela, cobrança, retorno, aplicação e conciliação. |
| **Direitos por estado** | Entitlements segregados entre projetado, aguardando condição, elegível, bloqueado, autorizado, instruído, em conciliação, conciliado e compensado. | Saldo de caixa, contas a pagar ou distribuição paga. | Plano/regra, evento origem, condição, alçada, instrução e settlement. |
| **Aportes com marco pendente** | Compromissos de capital por estado de cronograma/condição, sem inferir participação eficaz. | Direito a parcelas do loteamento, receita ou distribuição. | Operação de capital, marco, evidência, conciliação e instrumento. |

## 3. Regras de apresentação

| Situação | Apresentação correta | Apresentação proibida |
| --- | --- | --- |
| Estado de lote | Mapa/tabela de estado com recorte, legenda, `as_of` e link ao lote. | Percentual de “vendido” que ignore reserva, alocação, restrição e distrato. |
| Jornada comercial | Lista priorizada e funil somente se etapas, coorte, reentrada e denominadores forem definidos. | Funil de estados paralelos ou de snapshots incompatíveis. |
| Carteira | Aging/tabela/linha por natureza e prova, sempre com data de corte. | Card de “receita” que some boleto, caixa, provisão e settlement. |
| Repasses | Fila/KPIs por estado e tabela de explicação do entitlement. | Donut único que trate projeção como valor disponível ou pago. |
| Alerta executivo | Prioridade, motivo, owner, prazo, fonte e próxima ação. | Alerta sem origem, sem owner ou usado como atalho de alteração material. |

## 4. Invariantes de leitura

| Invariante | Resultado esperado |
| --- | --- |
| Toda métrica possui owner, fórmula, unidade, janela, escopo, fonte, estados, versão, `as_of` e limitação. | Número sem definição aparece como indisponível/não definido, não como fato. |
| A mesma métrica não muda de nome/conceito entre painel e setor. | Painel aponta para a `MetricDefinition` contextual, e não recria cálculo próprio. |
| Visual executivo leva ao fato fonte. | Usuário pode abrir lista/linha permitida sem ganhar escopo adicional. |
| Filtro não é autorização. | Organização, SPE, empreendimento, fase, lote, período e carteira são revalidados por policy. |
| Estados incertos continuam explícitos. | `Em análise`, parcial, previsto e conciliado não são colapsados por estética. |
| Relatório externo é um comando governado. | Exportação continua condicionada a finalidade, conteúdo, acesso, marca/registro, retenção e auditoria. |

## 5. Consolidação executiva sem duplicação

| Superfície | Pode consolidar | Deve declarar | Não pode fazer |
| --- | --- | --- | --- |
| **Painel Loteadora** | Alertas e poucos indicadores operacionais do empreendimento, fase, estoque, jornada, carteira e direitos. | Organização/SPE, recorte, período, `as_of`, frescor, definição, limitação e link para a origem. | Somar estados paralelos, alterar fatos operacionais ou esconder pendência no agregado. |
| **ADM** | Indicadores executivos de módulos contratados dentro da própria organização, por entidade/SPE e alçada. | Cobertura de módulos, entidades incluídas/excluídas, escopo do usuário e origem de cada métrica. | Ler outra organização, operar dado fora do módulo contratado ou chamar informação parcial de total. |
| **Painel de Sócio/Parceiro** | Somente direitos, contratos, lotes e carteira que integram vínculo/grupo autorizado. | Contexto do Grant de Portal, pool, vigência, `as_of` e estados de projeção/realizado. | Usar indicadores executivos como forma de expor carteira global, outros grupos ou gestão interna. |
| **Super ADM** | Saúde agregada da plataforma e indicadores SaaS/operacionais autorizados, sob escopo mínimo. | Finalidade, anonimização/agregação quando aplicável e acesso JIT auditado para exceções. | Transformar consolidação de plataforma em leitura cotidiana de dados financeiros/dossiês do tenant. |

## 6. Filtros, drill-down e estados de atualização

| Controle | Regra | Resultado seguro |
| --- | --- | --- |
| **Filtro de identidade** | Organização, entidade/SPE e contexto de portal derivam da sessão/grant/policy; não são aceitos como autoridade por URL. | Trocar query string não amplia organização, parceiro, grupo ou carteira. |
| **Filtro de negócio** | Empreendimento, fase, quadra, lote, contrato, recebedor, período e estado só filtram objetos já autorizados. | Interface pode reduzir/ordenar o resultado, mas policy continua no servidor/banco. |
| **Drill-down** | Card/linha só abre lista/fato que usa o mesmo `DashboardQuery`, policy, recorte e snapshot. | Usuário entende o número sem receber linhas de outra carteira/entidade. |
| **Frescor** | Todo card/visual mostra `as_of`, origem, atraso/estado parcial quando aplicável e timezone de exibição. | Evento em análise não aparece como tempo real/definitivo. |
| **Erro/vazio** | Ausência, erro de fonte, política negada, denominador zero ou parcialidade têm estado próprio e correlação protegida. | Não exibir zero inventado, tendência falsa, SQL/stack ou referência a objeto de terceiro. |
| **Desempenho** | Agregação, paginação, limite e cancelamento ocorrem na camada autorizada. | Cliente não baixa carteira crua, não soma dados fora do escopo nem congela para desenhar. |

## 7. Exportação controlada

A exportação não nasce porque um usuário enxerga um card. Ela é uma solicitação de dado com finalidade, conteúdo, destinatário e retenção próprios. Nesta etapa, a decisão é de governança; nenhum CSV, PDF, e-mail ou integração de exportação foi ativado.

| Requisito | Deve registrar | Deve bloquear |
| --- | --- | --- |
| **Finalidade e conteúdo** | Motivo, tipo de relatório, métrica/linhas, período, campos, destinatário e necessidade declarada. | Exportar “tudo que está na tela” sem verificar conteúdo permitido. |
| **Policy e escopo** | Organizações/SPEs/objetos autorizados, papel, vigência, AAL quando exigido e verificação no momento da geração. | Reutilizar exportação/link após revogação ou transferir a outra pessoa sem nova policy. |
| **Snapshot e definição** | Versão de métrica, filtros, `as_of`, timezone, transformação e eventuais limitações. | Arquivo sem origem/reprodutibilidade ou que muda silenciosamente depois de gerado. |
| **Proteção de arquivo** | Classificação, marca d’água/lote quando aplicável, armazenamento privado, expiração, retenção e audit event. | Link público permanente, anexos sensíveis em logs ou arquivo sem controle de acesso. |
| **Princípio de mínimo** | Colunas e linhas necessárias à finalidade, com mascaramento quando possível. | CPF/CNPJ, documentos, dados bancários, dossiê, carteira ou direitos de terceiros por conveniência. |

## 8. Critérios de aceite futuros

| Cenário | Deve permitir | Deve negar |
| --- | --- | --- |
| ADM filtra por empreendimento/fase da organização. | Atualizar métricas contextuais e manter `as_of`/definição/linhagem. | Cruzar SPE/organização sem grant, ou misturar módulos não contratados. |
| Card de carteira abre lista de parcelas. | Abrir somente linhas abrangidas pelo mesmo recorte/policy e estado de prova. | Expandir de “atrasados” para todos os clientes/parcelas não autorizados. |
| Métrica está parcial ou fonte atrasou. | Exibir estado, limitação e data de corte. | Mostrar zero, esconder atraso ou rotular previsão como conciliado. |
| Usuário solicita exportação. | Criar pedido governado se política/finalidade/escopo permitirem. | Gerar arquivo direto, público ou abrangendo dados/colunas não autorizados. |
| Parceiro troca parâmetro do link de relatório. | Revalidar Grant de Portal, pool e objetos no servidor/banco. | Expor indicadores da loteadora ou de outro grupo. |

## Referências internas

[1] [Contratos de métricas e visualização](crm_dashboard_visualizacao_consolidacao.md)

[2] [Estoque de contratos realizados e alertas](crm_loteadora_estoque_contratos_realizados_alertas.md)

[3] [Setor de Repasses e Distribuição](crm_loteadora_repasses_distribuicao_setor.md)

[4] [Subledger da imobiliária](crm_subledger_imobiliaria.md)
