# Jornadas operacionais de Vendas Urbanas e Locação

**Status:** `estratégia_documental_2026-08-27`  
**Escopo:** somente Vendas Urbanas e Locação. Este caderno transforma as evidências disponíveis em decisões de jornada, critérios de aceite, cenários de exceção e indicadores; não implementa nenhuma funcionalidade do CRM. [1] [2]

## 1. Regra de desenho

> **Recomendação:** desenhar cada jornada como uma sequência de fatos, decisões e próximos passos com responsáveis claros, e não como uma coleção de telas. Uma tela pode listar, filtrar, ordenar, abrir um formulário ou mostrar um estado vazio; o produto próprio deve preservar o que cada ação significa, quem pode realizá-la e qual prova a confirma.

| Princípio | Aplicação nas duas colunas |
| --- | --- |
| Contexto antes de ação | Toda operação futura começa com organização, módulo, objeto, finalidade, papel/grant, vigência e alçada. |
| Progressão por evidência | O cadastro aprofunda dados conforme a etapa e não exige dossiê completo na primeira interação. |
| Estados explícitos | Um status nunca deve ocultar a diferença entre rascunho, solicitado, pendente, aprovado, recusado, expirado, cancelado, concluído ou exceção. |
| Próximo passo explicável | A interface informa o que falta, quem é responsável, o prazo, a origem e o motivo de qualquer bloqueio. |
| Ação reversível ou compensável | Operações críticas exigem confirmação contextual, idempotência, evento de auditoria e caminho de reversão/compensação. |
| Métrica ligada ao fato-fonte | Cards, funis e alertas declaram fórmula, origem, corte temporal, escopo, frescor e limitação. |

## 2. Vendas Urbanas — jornada do lead ao contrato

### 2.1 Mapa de estados e responsabilidades

| Etapa | Objetivo | Fatos e dados mínimos | Decisão/owner | Saída válida |
| --- | --- | --- | --- | --- |
| Origem e entrada | Receber interesse sem perder origem, consentimento ou contexto. | Canal, campanha/origem quando houver, data, interesse declarado, contato mínimo permitido. | Sistema registra; gestor define regras de distribuição. | Lead criado ou evento de entrada correlacionado. |
| Triagem e qualificação | Identificar capacidade, urgência, região e tipo de busca sem antecipar análise documental. | Perfil de busca, janela temporal, faixa declarada, origem, preferência de contato, observações classificadas. | Corretor/atendente; gestor supervisiona SLA. | Próxima ação, responsável e data definidos; ou descarte justificado. |
| Vinculação de partes | Relacionar cliente, potencial comprador, coadquirente, representante ou empresa. | Party, papel, relação, representação, consentimento e evidência mínima. | Atendente coleta; policy regula informação sensível. | Papel datado e contexto comercial criado sem duplicação. |
| Matching de ativos | Selecionar imóveis/unidades aderentes com explicação de elegibilidade. | Busca, critérios, disponibilidade, restrições, titularidade/captação/autorização vigentes. | Corretor; gestor decide exceções. | Ativo elegível indicado ou motivo de indisponibilidade explicado. |
| Visita e agenda | Converter interesse em encontro com confirmação e resultado. | Participantes, imóvel, data/hora, canal, situação, resultado e próxima ação. | Corretor conduz; calendário controla conflito. | Visita realizada, remarcada, cancelada ou não realizada com motivo. |
| Proposta | Formalizar condição comercial sem confundir com venda ou pagamento. | Versão, partes, ativo, preço/condições declaradas, validade, documentos requeridos, aprovação. | Corretor propõe; alçada aprova exceções. | Aceita, recusada, expirada, retirada ou substituída por nova versão. |
| Reserva quando aplicável | Restringir concorrência de forma temporária e auditável. | Objeto, proposta vinculada, prazo, owner, alçada, motivo e evidência. | Policy/gestor. | Reserva ativa, expirada, convertida ou cancelada sem ambiguidade. |
| Contrato e fechamento | Fixar termos, partes, versões e evidências da negociação aceita. | Instrumento, versões, assinaturas, anexos elegíveis, condições precedentes e marcos. | Responsável contratual; jurídico quando necessário. | Contrato formalizado, pendente, cancelado ou em exceção. |
| Pós-venda e financeiro | Acompanhar obrigações posteriores sem transformar projeção em caixa. | Direito de comissão, base, gatilho, agenda, evento de cobrança/retorno/conciliação quando aplicável. | Financeiro autorizado e alçadas. | Direito/apuração e fatos financeiros separados, com exceção tratada. |

### 2.2 Workbench comercial recomendado

O aprendizado da referência confirma valor em listas, filtros, ordenações, visões de pipeline, agenda e atalhos. O diferencial próprio não deve ser copiar a organização visual, mas tornar cada lista uma estação de trabalho explicável: filtros salvos por usuário/papel, estado vazio instrutivo, paginação estável, visão de detalhe com permissão e ações em lote somente quando forem reversíveis ou exigirem alçada.

| Superfície estratégica | Decisão recomendada | Critério de aceite futuro |
| --- | --- | --- |
| Lista de leads | Colunas configuráveis por papel, com origem, estágio, SLA, responsável, próxima ação e sinal de qualidade documental. | Ordenação/filtro/paginação não mudam dados, preservam escopo e oferecem estado vazio/erro explicável. |
| Pipeline | Estágios versionados, com regras de entrada/saída, owner, SLA e motivo de perda. | Arraste visual não é fonte de verdade: transição verifica pré-condições e registra evento. |
| Termômetro/priorização | Mostrar fatores e confiança da prioridade, separados de decisão humana. | Score explica origem/fatores/versão; não distribui lead, envia mensagem ou altera etapa sozinho. |
| Agenda | Consolidar visita, tarefa, retorno e prazo de proposta. | Conflito, cancelamento e comunicação mostram preview/política/consentimento antes de qualquer envio. |
| Clientes/proprietários | Operar Party e papéis com dossiê progressivo. | Busca protegida não expõe correspondências nem documentos fora da finalidade. |
| Imóveis/empreendimentos | Separar ativo, proprietário, captação, construtora, empreendimento, torre/unidade e correspondente. | Editar um vínculo não altera outros nem torna o ativo publicável por inferência. |

### 2.3 Exceções materiais de Vendas Urbanas

| Exceção | Comportamento estratégico recomendado | Prova futura |
| --- | --- | --- |
| Lead duplicado ou relacionamento incerto | Sugerir possível relação, exigir análise humana e preservar origem das versões. | Mesclar não apaga audit trail, anexos ou permissões sem decisão explícita. |
| Ativo indisponível após proposta | Bloquear conversão, explicar restrição e abrir caso de exceção/alternativa. | Nenhuma reserva/venda concorrente é criada pelo simples clique na interface. |
| Proposta expirada | Alterar para expirada, conservar versão e exigir nova proposta para retomar negociação. | Renovação não reaproveita automaticamente preço, documentação ou aprovação. |
| Documento vencido/incompleto | Exibir pendência por finalidade e impedir apenas a etapa afetada. | Não vaza tipo/conteúdo de documento a participante não autorizada. |
| Mudança de corretor/equipe | Registrar transição com motivo, data, owner anterior/novo e regras de carteira. | Acesso anterior é reduzido conforme policy, sem perda do histórico. |
| Comissão divergente | Abrir divergência entre regra, base, evento e apuração; bloquear instrução de pagamento. | Card não marca “pago” antes de direito, instrução, retorno e settlement. |

### 2.4 Indicadores de Vendas Urbanas

| Indicador | Fórmula/escopo que deverá ser declarado | Limite de interpretação |
| --- | --- | --- |
| Conversão por etapa | Entradas e saídas de cada estágio por coorte, período e origem. | Não comparar coortes/módulos sem declarar data de entrada e elegibilidade. |
| Tempo de primeira resposta | Tempo entre entrada qualificada e primeiro evento de atendimento. | Pausas, horário comercial e consentimento de canal devem ser configuráveis. |
| SLA de visita e proposta | Proporção de marcos atendidos no prazo pela equipe/segmento. | Não usar para avaliar pessoa sem considerar carteira, ausência e bloqueios externos. |
| Disponibilidade efetiva | Ativos elegíveis por restrição/autorização/situação, não simples total cadastrado. | Estoque exibido não substitui verificação da transação. |
| Cobertura de dossiê | Proporção de requisitos cumpridos por etapa, finalidade e validade. | Não é “qualidade” da parte nem aprovação automática. |
| Projeção de comissões | Direitos estimados por base, gatilho e versão de regra. | Não representa saldo, liquidação ou caixa realizado. |

## 3. Locação — jornada da administração à renovação ou rescisão

### 3.1 Mapa de estados e responsabilidades

| Etapa | Objetivo | Fatos e dados mínimos | Decisão/owner | Saída válida |
| --- | --- | --- | --- | --- |
| Captação/administração | Formalizar a relação com proprietário e imóvel antes de anunciar/locar. | Party/proprietário, ativo, representação, contrato de administração, vigência, obrigações e evidências. | Gestor de locação, com alçadas. | Administração ativa, pendente, recusada, encerrada ou em exceção. |
| Preparação do imóvel | Avaliar disponibilidade, vistoria, chaves, divulgação, restrições e serviços necessários. | Estado do ativo, ambientes/itens quando aplicável, evidências, responsável, prazo e bloqueios. | Gestor de imóvel/serviços. | Pronto para divulgar, bloqueado com motivo ou em preparação. |
| Interesse/candidatura | Coletar dados progressivamente de locatário e coobrigados. | Party, papel, busca, dados declarados, consentimento, evidência solicitada/recebida. | Atendente; política limita coleta e acesso. | Elegível para análise, pendente, desistente ou descartado com motivo. |
| Garantia | Tratar modalidade, análise, proposta e documento como estados distintos. | Modalidade, partes, requisitos, evidências, parecer, prazo e decisão. | Alçada definida; nenhum modelo aprova sozinho. | Aprovada, recusada, pendente, expirada ou substituída. |
| Proposta e negociação | Versionar valor, prazo, encargos, reparos, concessões e condições. | Versão, partes, ativo, validade, itens negociados, aprovações e pendências. | Consultor/gestor. | Aceita, recusada, expirada, retirada ou substituída. |
| Contrato de locação | Consolidar termos e marcos do contrato com o locatário. | Instrumento, índice, vencimento, multas, garantias, encargos, assinatura, vigência e anexos. | Responsável contratual. | Ativo, pendente de condição, cancelado ou em exceção. |
| Carteira e cobrança | Criar obrigações, instruções e acompanhamento de vencimento/retorno. | Obrigação, competência, vencimento, valor/regras, instrução, retorno, aplicação e conciliação. | Financeiro autorizado. | Regular, pendente, inadimplente, renegociado, contestado ou em conciliação. |
| Administração continuada | Acompanhar serviços, comunicação, repasse, prestação de contas e eventos do imóvel. | Caso, orçamento, autorização, evento financeiro, direito, instrução e evidência. | Gestor/financeiro conforme alçada. | Caso concluído/recusado/cancelado; financeiro separado por fato. |
| Renovação ou rescisão | Reavaliar prazo, condições, vistoria, obrigações, entrega e fechamento. | Proposta/aditivo, evidências, vistoria, valores finais, decisão e marcos. | Gestor/jurídico/financeiro conforme caso. | Renovado, rescindido, entregue, pendente de acerto ou em disputa. |

### 3.2 Separações inegociáveis de Locação

| Separação | Decisão estratégica | Erro que impede |
| --- | --- | --- |
| Administração × locação | Contrato com proprietário e contrato com locatário são entidades relacionadas, com prazos e obrigações independentes. | Alterar administração quando se edita prazo/encargo da locação, ou vice-versa. |
| Garantia × aprovação | Modalidade de garantia, documento recebido, análise e decisão são estados próprios. | Concluir que existir fiador/seguro/título significa que a locação foi aprovada. |
| Boleto × pagamento | Instrução de cobrança, retorno, aplicação de caixa, conciliação e comprovante são fatos distintos. | Baixar obrigação por evidência informal ou pela simples geração de boleto. |
| Despesa × direito × repasse | Serviço, custo, taxa, dedução, direito do proprietário e instrução de repasse possuem ciclos independentes. | Pagar prestador ou repassar proprietário automaticamente ao mudar card de status. |
| Vistoria × responsabilidade | Registro de condição, alegação, evidência, decisão e eventual cobrança são separados. | Atribuir culpa, indenização ou débito somente pela existência de fotos/ocorrência. |
| Portal × backoffice | Portal mostra recorte autorizado por grant e finalidade; não é espelho integral da operação interna. | Expor outro imóvel, contrato, documento, carteira ou observação interna. |

### 3.3 Workbench de Locação recomendado

| Superfície estratégica | Decisão recomendada | Critério de aceite futuro |
| --- | --- | --- |
| Carteira de negócios/aluguéis | Vistas por estado, próximo marco, pendência, prazo e owner, sem misturar contrato/financeiro. | Filtro e ordenação são somente leitura; transições exigem alçada, motivo e evento. |
| Padrões | Regras de contrato, reajuste, taxas, multas, vencimento e calendário versionadas por vigência. | Novo padrão não modifica contrato ou obrigação já formalizada sem aditivo/regra explícita. |
| Financeiro | Listas e dashboards por obrigação, instrução, retorno, aplicação, divergência, direito e repasse. | Todo estado financeiro aponta ao fato-fonte e a exceções; não há “baixar” por edição visual. |
| Serviços/prestadores | Caso com ativo, solicitante, responsabilidade, orçamento, agenda, aprovação, execução e evidência. | Dados do prestador são mínimos; mudança de status não paga, comunica ou altera contrato por si. |
| Vistorias/sinistros | Caso estruturado, com ambiente/item, cronologia, evidência, partes, prazos e decisão. | Anexo ou relato não fecha caso nem determina responsabilidade/cobertura. |
| Portal cliente/proprietário | Visão individual/grupo concedida por grant datado, objeto e finalidade. | Login sem grant não revela existência de contrato, cobrança, serviço ou documento. |

### 3.4 Exceções materiais de Locação

| Exceção | Comportamento estratégico recomendado | Prova futura |
| --- | --- | --- |
| Administração termina com locação ativa | Abrir exceção de continuidade e restringir atos conforme policy/contrato. | O sistema não cancela/renova a locação automaticamente nem expõe dados a novo administrador. |
| Garantia perde vigência | Sinalizar pendência, owner, prazo e regra de escalonamento. | Não invalida retroativamente contrato nem aplica cobrança automática sem regra. |
| Pagamento parcial/duplicado | Abrir aplicação de caixa e divergência, preservando valores e correlação. | Não considera parcela quitada até conciliação e regra de alocação. |
| Atraso e negociação | Tratar política, comunicação, promessa, acordo e vencimentos substituídos como eventos distintos. | Comunicação respeita destinatário, opt-in, política e prevenção de duplicidade. |
| Serviço contestado | Congelar decisão financeira relacionada, registrar evidências e alçada. | Nenhum repasse/pagamento se confirma somente por “concluído” do serviço. |
| Vistoria divergente | Manter versão, cronologia, autoria e itens contestados. | Não altera laudo anterior sem adendo/revisão rastreável. |
| Rescisão com valores pendentes | Separar marco de término, entrega, apuração, cobrança, direito e settlement. | Encerrar contrato não apaga obrigações, fatos financeiros ou evidências. |

### 3.5 Indicadores de Locação

| Indicador | Fórmula/escopo que deverá ser declarado | Limite de interpretação |
| --- | --- | --- |
| Taxa de ocupação elegível | Ativos com administração válida e situação locável, por período/recorte. | Não confundir imóvel cadastrado, ocupado, indisponível ou em manutenção. |
| Tempo de vacância | Tempo entre marcos definidos de disponibilidade e início de contrato. | Deve explicitar pausas por obra, documento, titularidade, restrição ou decisão do proprietário. |
| Cobertura de garantia | Contratos ativos com garantia vigente/pendente por modalidade. | Não é indicador de risco individual nem substitui análise humana. |
| Adimplência conciliada | Obrigações vencidas com aplicação/retorno conciliados por competência/coorte. | Boleto emitido, promessa ou comprovante isolado não entra como recebido. |
| Tempo de resolução de serviço | Abertura até decisão/conclusão, por tipo/responsável/urgência. | Não mede qualidade sem distinguir espera por autorização, fornecedor ou parte. |
| Renovação e rescisão | Contratos por janela de vencimento e desfecho, com motivo padronizado. | Não prever renovação individual sem explicabilidade, consentimento e revisão humana. |

## 4. Gates de decisão comuns

| Decisão futura | Recomendação | Gate de estratégia antes de implementação |
| --- | --- | --- |
| Criar formulário | Modelar primeiro fatos, estados, finalidade, permissão, evidência e saída de exceção. | Campo possui owner, classificação, validação, retenção e efeito definido. |
| Criar ação em lote | Começar em simulação/preview e exigir confirmação contextual/role. | Idempotência, escopo, logs, reversão/compensação e limites aprovados. |
| Criar automação | Começar por recomendação e tarefa, não alteração final automática. | Gatilho, dados usados, limite, aprovação humana, observabilidade e rollback definidos. |
| Criar dashboard | Partir de contrato de métrica e fato-fonte. | Fórmula, as_of, frescor, policy, estados vazio/erro e drill-down protegido documentados. |
| Criar integração externa | Usar contrato, outbox/inbox, correlação e tratamento de falha. | Segredo, consentimento, idempotência, limite, retry, auditoria e desconexão aprovados. |

## 5. Cadência de aprendizado

Cada piloto ou uso futuro deve produzir uma observação agregada, nunca apenas um pedido solto de interface. A observação é confrontada com a estratégia, classificada como reforço, ajuste, conflito ou hipótese e resulta em decisão versionada. Assim, a evolução da experiência não perde a integridade de dados e segurança para ganhar velocidade aparente.

## Referências internas

[1] [Estratégia atualizada — Vendas Urbanas e Locação](estrategia_vendas_urbanas_locacao_atualizada.md)

[2] [Fundação compartilhada — Vendas Urbanas e Locação](caderno_fundacao_compartilhada_vendas_locacao.md)

[3] [Consolidação de Vendas Urbanas](consolidacao_vendas_urbanas_hincrivel.md)

[4] [Consolidação de Locação](consolidacao_locacao_hincrivel.md)
