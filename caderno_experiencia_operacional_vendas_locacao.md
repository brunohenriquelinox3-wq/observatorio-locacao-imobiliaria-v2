# Experiência operacional e decisão — Vendas Urbanas e Locação

**Status:** `estratégia_documental_2026-08-27`  
**Escopo:** Vendas Urbanas e Locação. Este caderno define a experiência futura de trabalho, leitura, decisão e compartilhamento. Não cria telas, permissões, dados, exportações, mensagens, publicações ou automações. [1] [2]

## 1. Recomendação estratégica

> **Recomendação:** estruturar o CRM como uma sequência de espaços de trabalho por intenção — “o que precisa de atenção agora?”, “qual é o contexto confiável?”, “qual decisão posso tomar?” e “como registro/compartilho o resultado?” — e não como menus extensos ou telas que misturam lista, edição, financeiro e efeitos materiais.

O objetivo é permitir que cada papel possa **explorar os dados de forma mais intuitiva**, **entender melhor as tendências** e **salvar ou compartilhar facilmente**, sem ocultar origem, estado, incerteza, risco ou limite de acesso. A fluidez visual não pode ser obtida por atalhos que ampliem dados, executem comandos silenciosos ou confundam uma recomendação com uma decisão final.

## 2. Princípios de experiência por papel

| Princípio | Regra estratégica | Prova futura |
| --- | --- | --- |
| Intenção antes de volume | A entrada de cada espaço apresenta a próxima decisão/trabalho e não uma lista máxima por padrão. | Teste mostra que o usuário encontra pendência/ação sem ampliar visibilidade desnecessária. |
| Contexto antes de ação | Todo comando identifica objeto, estado, owner, consequência, dependência e retorno. | Teste de comando confirma que o usuário vê a consequência e a rota de volta antes de confirmar. |
| Estado explícito | Rascunho, pendente, bloqueado, em revisão, elegível, aprovado, falho e concluído não usam apenas cor. | Leitura visual/textual/acessível diferencia estados e explica o motivo. |
| Menor exposição | A lista começa com dados mínimos e revela detalhes somente em contexto autorizado. | Teste por URL, busca e paginação impede acesso/enumeração fora do escopo. |
| Reversibilidade | Ações locais têm cancelar/restaurar; efeito material depende de alçada, confirmação e correlação. | Teste demonstra cancelamento, prevenção de duplo envio e, quando aplicável, compensação auditável. |
| Explicabilidade | Métrica, alerta e sugestão exibem fonte, período, fatores, cobertura, limitação e owner. | Usuário consegue explicar por que viu o sinal e contestá-lo. |
| Continuidade | A mesma tarefa preserva sua trilha entre lista, detalhe, agenda, documento e decisão. | O retorno não perde filtro/contexto permitido e não amplia o escopo. |
| Inclusão operacional | Teclado, foco visível, contraste, mensagem de erro, leitura alternativa e redução de movimento são requisitos de produto. | Testes assistivos e de fluxo confirmam navegação e entendimento sem mouse/cor exclusiva. |

## 3. Anatomia do espaço de trabalho

| Camada | Pergunta respondida | Conteúdo permitido | Limite obrigatório |
| --- | --- | --- | --- |
| Cabeçalho de contexto | Onde estou, para qual organização/carteira e com quais permissões? | Título, finalidade, recorte, período, estado de atualização e ações permitidas. | Não usar tenant, URL ou filtro como prova de autorização. |
| Faixa de atenção | O que exige triagem ou decisão? | SLA, pendência, conflito, exceção, item sem owner e alteração relevante. | Sem alertas ornamentais; cada alerta indica motivo, impacto e caminho permitido. |
| Leitura principal | Qual é o estado da carteira/jornada? | Tabela, kanban, linha do tempo, calendário, mapa ou métrica adequada à pergunta. | Não usar gráfico para ocultar dados conflitantes ou lista para simular decisão. |
| Painel de contexto | O que explica este item? | Atributos mínimos, relações, evidências, estados, histórico e restrições autorizados. | Abrir painel não concede edição nem acesso a objetos relacionados fora do grant. |
| Área de decisão | O que posso encaminhar agora? | Próxima ação, rascunho, revisão, solicitação de alçada ou comando autorizado. | Efeitos materiais exigem precondições, confirmação, idempotência e auditoria. |
| Linha de confiança | Como sei a origem/frescor/limitação? | `as_of`, fonte, cobertura, versão, owner e aviso de dados incompletos. | Não apresentar número/score sem contrato de métrica e limitação. |

## 4. Espaços de trabalho — Vendas Urbanas

| Espaço | Decisão principal | Leitura/fluxo recomendado | Controles e limites |
| --- | --- | --- | --- |
| Central de demanda | Qual lead/oportunidade demanda atenção e por quê? | Fila priorizada, filtros progressivos, SLA, origem, próxima ação e estado explicável. | Pesquisa por identificação deve ser protegida; lista não oferece atribuição, exclusão ou exportação como ação implícita. |
| Pipeline de oportunidades | Onde há avanço, estagnação ou risco comercial? | Colunas de etapa com critérios de entrada/saída, idade da etapa, razão de bloqueio e capacidade. | Arrastar card não muda estado sem validação de transição, alçada e trilha. |
| Agenda e visitas | Qual atividade é devida e qual resultado produz a próxima ação? | Calendário/lista conectados à oportunidade, ativo, participante e retorno. | Não enviar convite/mensagem ou expor endereço/acesso sem policy e confirmação. |
| Captação e ativos | O ativo está apto à captação, divulgação, visita e negociação? | Checklist de autorização, completude, disponibilidade, preço/condição datados e dossiê. | Status visual não substitui titularidade, autorização de anúncio ou policy de campo. |
| Empreendimentos | Como navegar estrutura de empreendimento sem perder a unidade? | Hierarquia empreendimento → torre/bloco → unidade, estado comercial e vínculos. | Relação estrutural não autoriza publicação, alteração de estoque ou precificação. |
| Proposta e negociação | Qual versão está em revisão e qual é o próximo gate? | Linha do tempo de versões, condições, validade, pendência, aprovação e razão de mudança. | Aceite não gera contrato, cobrança ou comissão sem fluxo/autorização próprios. |
| Dossiê de partes | Que evidências são necessárias para a etapa? | Ficha progressiva, papéis temporais, documentos/validade e pendências por finalidade. | Documento aberto não é validação; campos sensíveis têm acesso minimizado. |
| Financeiro comercial | Qual direito/obrigação é previsível, elegível ou divergente? | Lentes separadas de comissão, obrigação, conciliação, direito e liquidação. | Número não é “pago” sem fato de retorno/aplicação/conciliado; sem repasse automático. |
| Inteligência comercial | Que sinal merece revisão humana? | Métricas de saúde, origem, propensão e exceções com fatores e cobertura. | Score não atribui lead, muda preço ou dispara campanha automaticamente. |

## 5. Espaços de trabalho — Locação

| Espaço | Decisão principal | Leitura/fluxo recomendado | Controles e limites |
| --- | --- | --- | --- |
| Administração e carteira de ativos | Qual ativo/relação exige revisão de vigência, autorização ou pendência? | Lente por administração, imóvel, proprietário, prazo, condição e tarefa. | Administração vigente é relação temporal, não consequência de cadastro de imóvel. |
| Esteira de nova locação | O processo pode avançar sem antecipar coleta/decisão? | Etapas de candidato, imóvel, garantia, proposta, contrato e checklist. | Não aprovar garantia, contrato ou cobrança por estado visual ou campo preenchido. |
| Contratos, aditivos e renovação | Qual instrumento está vigente, em transição ou perto de revisão? | Linha do tempo contratual, obrigações, janelas, pendências e cenário de renovação/rescisão. | Não substituir instrumento aceito sem versão, motivo, alçada e preservação do original. |
| Carteira e exceções | Que obrigação/retorno/divergência deve ser tratada primeiro? | Fila por estado financeiro, competência, atraso, divergência, owner e evidência. | Cobrança não é baixa; baixa não é conciliação; conciliação não é repasse. |
| Serviços, vistorias e sinistros | Qual caso está aberto, qual é a evidência e quem decide? | Kanban/lista de casos com tipo, prazo, owner, orçamento, evidência e decisão. | Caso não gera contratação, pagamento, culpa ou comunicação automática. |
| Prestadores | A capacidade/qualificação do fornecedor atende à finalidade? | Perfil mínimo, habilitação, categoria, cobertura, validade e histórico autorizado. | Cadastro de prestador não cria vínculo, tarefa, pagamento ou acesso a caso. |
| Portais e comunicação | O que pode ser publicado/compartilhado em qual canal? | Matriz por ativo, canal, versão, autorização, preview, owner e resultado. | Nenhuma publicação, integração ou mensagem sai sem precondição e confirmação governada. |
| Portal de parte externa | O que cada pessoa pode consultar/acompanh ar? | Landing por grant com contratos, documentos, estados/alertas e leituras mínimas. | Sem notas internas, dados de terceiros, detalhes de cobrança/repasses ou ações materiais fora do grant. |

## 6. Exploração de dados e tendências

O CRM deve oferecer uma jornada de análise em três níveis: **resumo confiável**, **recorte explicável** e **detalhe autorizado**. Essa progressão reduz a necessidade de exportar dados para compreender a operação e torna qualquer compartilhamento uma decisão consciente.

| Necessidade | Padrão recomendado | Contrato mínimo da leitura |
| --- | --- | --- |
| Acompanhar operação | KPI e fila de exceção na abertura do espaço. | Definição, fórmula, período, `as_of`, cobertura, limite e owner. |
| Comparar período/origem/carteira | Segmentação visível, filtro datado e preservação de contexto. | Critério, população elegível, timezone, regra de inclusão/exclusão e qualidade. |
| Entender jornada | Funil, linha do tempo ou coorte conforme a pergunta. | Eventos de entrada/saída, etapa, versão da regra e causa de perda/bloqueio. |
| Investigar causa | Drill-down até o nível permitido, com razão de permissão/negação. | Linhagem, campos permitidos, relações e limite de profundidade. |
| Priorizar ação | Fila com motivo, severidade, SLA, owner e próxima ação possível. | Regra de prioridade, fatores, exceções e possibilidade de contestação. |
| Compartilhar conclusão | Visão salva com recorte, parâmetros, propósito, expiração e destinatário autorizado. | Política de campos, marca d’água quando aplicável, log, expiração e revogação. |

### Regras de gráficos e leitura visual

| Pergunta | Visual preferencial | Antipadrão a evitar |
| --- | --- | --- |
| Evolução ao longo do tempo | Linha ou área com período, lacunas e `as_of` explícitos. | Linha contínua que oculta ausência de dados, mudança de regra ou período incomparável. |
| Conversão de jornada | Funil com população, passos e perdas explicados. | Funil sem critério de entrada/saída ou sem deixar claras as coortes. |
| Distribuição/carteira | Barras/tabela ordenada por categoria/estado. | Pizza com muitas categorias ou valores sem base/percentual. |
| Prazo/SLA | Calendário, aging ou barras temporais com fila correspondente. | Cor de urgência sem prazo/owner e sem lista de ação. |
| Relação espacial | Mapa somente quando localização é necessária e permitida. | Mapa que revela endereço/posição exata a papel sem finalidade. |
| Tendência financeira | Série por competência/categoria e reconciliação à visão de exceção. | Card consolidado que mistura obrigação, caixa, direito e liquidação. |

## 7. Salvar, compartilhar e exportar com governança

| Capacidade futura | Requisito estratégico | Gate de aceite |
| --- | --- | --- |
| Visão salva | Salva parâmetros, ordenação, recorte e finalidade; é privada por padrão. | Restaurar a visão não amplia campos/objetos e registra origem/versão da regra. |
| Compartilhamento interno | Destinatário, escopo, campos, expiração e motivo explicitados. | Destinatário perde acesso ao expirar/revogar ou ao sair do escopo. |
| Exportação | Tratada como comando de risco: propósito, policy, colunas, volume, confirmação, log e retenção. | Testes impedem exportar colunas/linhas fora da policy e registram quem/quando/o quê. |
| Relatório externo | Gera snapshot datado com fonte, `as_of`, contexto e classificação. | Arquivo não contém detalhes além do permitido e tem expiração/marca apropriada quando necessário. |
| Portal/link | Concedido por grant, objeto e finalidade, com validade/revogação. | Alterar URL, identificador ou parâmetro não concede acesso adicional. |
| Notificação | Prévia, alvo, canal, motivo, consentimento/policy e idempotência. | Nenhuma notificação é enviada apenas por abertura de tela ou mudança de filtro. |

## 8. Estados, erros e acessibilidade

| Situação | Resposta de experiência | O que não fazer |
| --- | --- | --- |
| Sem dados | Explicar se o recorte está vazio, se não há permissão, se a sincronização está pendente ou se ocorreu falha. | Usar o mesmo vazio para erro, ausência de acesso e ausência de registros. |
| Carregamento | Indicar conteúdo sendo carregado, preservar contexto e permitir cancelar quando relevante. | Skeleton infinito sem prazo, diagnóstico ou fallback. |
| Permissão negada | Mostrar mensagem segura, escopo/finalidade geral e rota legítima de solicitação, sem enumerar objeto. | Dizer que um registro existe ou revelar identidade/atributos de objeto negado. |
| Validação local | Mensagem por campo e resumo acessível, preservando entradas seguras. | Limpar o formulário inteiro ou mostrar erro apenas por cor/ícone. |
| Conflito | Informar versão, mudança, owner, opções permitidas e consequência. | Sobrescrever silenciosamente a edição anterior. |
| Falha externa | Distinguir indisponibilidade, configuração ausente, timeout e resposta inválida; oferecer correlação/suporte. | Repetir comando automaticamente sem chave idempotente ou fingir conclusão. |
| Operação bloqueada | Explicar precondição/alçada faltante e próximo caminho permitido. | Fazer o usuário “tentar de novo” sem motivo ou abrir canal paralelo sem registro. |

## 9. Critérios de aceite de experiência

| Código | Critério de aceite futuro |
| --- | --- |
| `EXP-01` | Cada espaço de trabalho mostra contexto, escopo, atualização/frescor e estado de permissão de forma compreensível. |
| `EXP-02` | Nenhuma decisão material ocorre por clique ambíguo, mudança local de filtro, arraste ou atalho não confirmado. |
| `EXP-03` | Lista, filtro, página, busca e exportação respeitam a mesma policy no servidor; parâmetro de URL não amplia o escopo. |
| `EXP-04` | Todo alerta/métrica/recomendação exibe fonte, período, fatores, limitação, owner e caminho de contestação. |
| `EXP-05` | Estado vazio, bloqueado, carregando, erro e sucesso são distintos para visão, teclado e tecnologia assistiva. |
| `EXP-06` | Visões salvas/compartilhadas/exportadas preservam escopo, finalidade, expiração, revogação e auditoria. |
| `EXP-07` | Toda interação de alto risco demonstra confirmação, precondições, idempotência, correlação e rota de recuperação. |
| `EXP-08` | Usuários conseguem percorrer jornada crítica por teclado com foco previsível e sem depender de cor, hover ou movimento. |

## Referências internas

[1] [Matriz mestre estratégica — Vendas Urbanas e Locação](matriz_mestre_estrategica_vendas_locacao.md)

[2] [Inteligência, métricas, automação e canais](caderno_inteligencia_metricas_canais_vendas_locacao.md)

[3] [Jornadas operacionais — Vendas Urbanas e Locação](caderno_jornadas_operacionais_vendas_locacao.md)

[4] [Registro de auditoria por controle](registro_auditoria_por_controle_v2.md)
