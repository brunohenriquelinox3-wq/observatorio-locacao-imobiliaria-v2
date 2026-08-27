# Validação, pilotos e aprendizagem — Vendas Urbanas e Locação

**Status:** `estratégia_documental_2026-08-27`  
**Escopo:** Vendas Urbanas e Locação. Este caderno define como validar uma futura implementação de forma gradual, segura e mensurável; não autoriza pilotos reais, coleta adicional, comunicação, cobrança, publicação ou qualquer operação do CRM. [1] [2]

## 1. Recomendação estratégica

> **Recomendação:** validar por hipótese e jornada crítica, começando por fluxo de menor risco e maior capacidade de aprendizagem. Um piloto não deve “provar o produto inteiro”; ele deve reduzir uma incerteza específica, com grupo, período, owner, métrica, limite de segurança, critério de pausa e decisão de continuidade previamente definidos.

O produto só pode avançar de protótipo para uso supervisionado quando o comportamento técnico, o acesso, a auditoria e a recuperação forem demonstrados. O ganho de velocidade de uma liberação ampla não compensa o risco de expor dossiês, confundir fatos financeiros, gerar comunicação indevida ou consolidar um processo sem evidência.

## 2. Unidade de validação e limites

| Elemento | Decisão estratégica |
| --- | --- |
| Unidade de observação | Uma organização voluntária, um time definido, uma jornada, uma carteira/recorte autorizado e um intervalo temporal fechado. |
| Coorte de piloto | Grupo de uso explicitamente habilitado, com owner de negócio, owner técnico e canal de suporte definido. |
| Controle | Quando possível, comparar antes/depois ou grupo piloto/grupo não piloto sem esconder funcionalidade crítica de segurança. |
| Dados | Preferir dados sintéticos e, se houver uso autorizado de dados operacionais, aplicar minimização, finalidade, acesso mínimo e logs. |
| Escopo | Um módulo, capacidade ou decisão por vez; não ativar financeiro, publicação, comunicação ou integração como efeito colateral. |
| Tempo | Data de início, período de observação, marco de revisão e data de expiração/renovação do piloto registrados. |
| Efeito material | Permanece fora do piloto inicial até passar por gates específicos de segurança, alçada, idempotência e recuperação. |

## 3. Hipóteses prioritárias — Vendas Urbanas

| Código | Hipótese a reduzir | Capacidade futura em observação | Métricas de aprendizagem | Limite de segurança | Critério de decisão |
| --- | --- | --- | --- | --- | --- |
| `PVU-01` | Uma ficha progressiva reduz retrabalho sem esconder pendências críticas. | Parte/papel, intenção, dossiê mínimo e tarefas. | Tempo de conclusão de etapa, campos reabertos, pendências por fase e percepção de clareza. | Sem consulta/validação externa automática; dossiê sensível mínimo. | Escalar se pendências ficam mais visíveis e não aumenta erro/retrabalho. |
| `PVU-02` | Fila com SLA, próxima ação e motivo torna a carteira mais previsível. | Lista e priorização explicável de leads/oportunidades. | Itens sem próxima ação, SLA vencido, tempo de resposta e rejeição de sugestão. | Sem atribuição/redistribuição automática. | Manter se a fila reduz esquecimento sem concentração indevida de trabalho. |
| `PVU-03` | Agenda ligada ao ativo e à oportunidade melhora a continuidade entre visita e proposta. | Visita, atividade, resultado e próxima ação. | Conflitos evitados, visitas com retorno estruturado e tempo até próxima ação. | Sem envio automático de convite/mensagem. | Escalar se contexto e continuidade aumentam sem ampliar acesso ao imóvel/parte. |
| `PVU-04` | Proposta versionada reduz divergência comercial e preserva negociação. | Rascunho, condições, validade, alçada e evidência. | Versões por proposta, motivo de alteração, tempo de aprovação e conflito detectado. | Sem assinatura, contrato, cobrança ou alteração de preço sem alçada. | Avançar se versão aceita não é sobrescrita e conflitos são detectáveis. |
| `PVU-05` | Saúde de funil/origem permite priorizar decisão sem score opaco. | Métricas e sinais explicáveis. | Cobertura de origem, completude de fatores, contestação e decisão humana por sinal. | Sem campanha, roleta ou ação comercial automática. | Escalar se usuários entendem e corrigem os sinais antes de usá-los. |

## 4. Hipóteses prioritárias — Locação

| Código | Hipótese a reduzir | Capacidade futura em observação | Métricas de aprendizagem | Limite de segurança | Critério de decisão |
| --- | --- | --- | --- | --- | --- |
| `PLC-01` | Separar administração e locação reduz conflito de prazo e responsabilidade. | Vínculos/contratos independentes ligados ao mesmo ativo. | Exceções detectadas, pendências por vínculo, correções e clareza percebida. | Sem alterar contratos vigentes automaticamente. | Escalar se a separação reduz ambiguidade sem duplicar trabalho. |
| `PLC-02` | Esteira com rascunho e validação por etapa reduz coleta prematura e abandono invisível. | Candidatura, garantia, contrato e dossiê progressivos. | Abandono/retomada, pendência por etapa, erros de validação e tempo por fase. | Sem decisão automática de garantia/contratação. | Avançar se requisitos ficam visíveis e nenhuma decisão é inferida por ausência. |
| `PLC-03` | Carteira por estados financeiros melhora o tratamento de exceção. | Obrigação, instrução, retorno, aplicação e conciliação em lentes distintas. | Itens divergentes, tempo de tratamento, duplicidades evitadas e reconciliação de cenários sintéticos. | Sem boleto, baixa, cobrança, pagamento ou repasse reais. | Escalar somente se estados permanecem distintos em atraso, parcial, duplicidade e estorno. |
| `PLC-04` | Caso de serviço com owner e alçada evita perda de manutenção/vistoria. | Caso, prazo, orçamento, decisão e evidência. | SLA, reabertura, ausência de owner e tempo até decisão. | Sem contratação, pagamento, cobrança ou atribuição de culpa. | Avançar se o caso mantém cronologia/evidência e não cria efeito financeiro. |
| `PLC-05` | Portal de finalidade limitada aumenta transparência sem ampliar dados. | Grant, leitura mínima e histórico autorizado. | Tentativas negadas corretas, uso por escopo, compreensão do estado e revogações. | Sem exibir dados de terceiros, notas internas ou direitos não elegíveis. | Escalar se tentativas por URL/manipulação falham de modo seguro. |

## 5. Métricas de sucesso e proteção

Uma métrica de piloto não é métrica financeira oficial e não deve servir para remunerar, punir ou concluir causalidade isoladamente. Ela mede a qualidade da hipótese e deve apresentar coorte, período, fonte, cobertura, `as_of`, limitação e owner.

| Família | Indicadores permitidos | Sinal de atenção |
| --- | --- | --- |
| Eficiência | Tempo até próxima ação, tempo por etapa, retrabalho, conclusão de checklist, itens sem owner. | Ganho de velocidade com aumento de erro, pendência ou acesso excessivo. |
| Qualidade | Campos corrigidos, versões preservadas, conflitos detectados, explicação compreendida, decisões contestadas. | Sugestão aceita sem compreensão, dado incompleto tratado como definitivo ou versão perdida. |
| Segurança | Negação correta, acesso fora de escopo bloqueado, uso de step-up, eventos auditáveis e revogação efetiva. | Vínculo/URL expõe objeto não autorizado, log incompleto ou política aplicada só na interface. |
| Confiabilidade | Erro por fluxo, duplicidade, retentativa, recuperação, backlog de divergências e tempo de resolução. | Falha mascarada como sucesso, comando repetido ou divergência sem owner. |
| Experiência | Clareza de estado, taxa de abandono/retomada, feedback qualitativo estruturado e treinamento necessário. | Usuário não entende pendência, estado financeiro, motivo de bloqueio ou próxima ação. |
| Aprendizado | Hipóteses confirmadas/refutadas, decisões alteradas, evidências novas e lacunas reabertas. | Piloto encerra sem decisão, sem owner ou sem atualização da estratégia. |

## 6. Gates de entrada, acompanhamento e saída

| Gate | Pergunta obrigatória | Evidência mínima |
| --- | --- | --- |
| Entrada | A hipótese é específica, o grupo está definido e o risco é proporcional? | Carta de piloto com owner, escopo, duração, dados, métricas, limites e canal de suporte. |
| Prontidão técnica | Contexto, policy, logs, estado vazio/erro e rollback/compensação foram demonstrados? | Testes de permitir/negar, falha, duplicidade, retentativa e recuperação aprovados. |
| Prontidão operacional | Participantes entendem objetivo, limites, apoio e caminho de escalonamento? | Material de operação, consenso de papéis e owner de decisão. |
| Acompanhamento | Métricas têm fonte, corte, cobertura, limitação e revisão humana? | Painel/leitura com contrato de métrica e revisão periódica registrada. |
| Pausa | Há sinal de segurança, integridade, efeito material inesperado ou falha repetida? | Critério explícito de suspensão, contenção e comunicação interna. |
| Saída | A hipótese foi respondida e a decisão foi tomada? | Relatório de resultado, evidência, decisão, requisitos alterados e itens reabertos. |
| Escala | Segurança, qualidade e benefício se sustentam fora da coorte inicial? | Nova avaliação de impacto, capacidade, suporte e critérios de aceite ampliados. |

## 7. Critérios de pausa, reversão e correção

| Evento | Resposta estratégica |
| --- | --- |
| Acesso fora de escopo ou evidência de vazamento | Suspender a capacidade, preservar logs, conter o acesso, avaliar impacto e somente retomar após correção/teste independente. |
| Estado financeiro inconsistente | Bloquear consequências dependentes, abrir divergência, preservar fatos originais e evitar “correção” que apague rastros. |
| Comunicação/publicação não pretendida | Cancelar quando possível, registrar correlação, avaliar destinatário/canal e corrigir a causa antes de reativar. |
| Regra ou métrica não explicável | Remover o sinal da decisão operacional, registrar limitação e voltar a uma leitura descritiva até revisão. |
| Crescimento de retrabalho/erro | Pausar expansão, observar a jornada, simplificar o requisito ou corrigir treinamento/experiência antes de interpretar resultado. |
| Uso fora da finalidade do piloto | Encerrar ou recontratar o escopo; não manter coleta/acesso porque a capacidade “já existe”. |

## 8. Registro de aprendizado

Cada piloto deve gerar um registro conciso e revisável. A ausência de resultado é um resultado operacional: ela indica que a hipótese, a métrica, a coorte ou a instrumentação precisam ser corrigidas antes de ampliar o escopo.

| Campo | Conteúdo obrigatório |
| --- | --- |
| Hipótese e decisão | Qual incerteza foi testada e qual decisão ela deveria informar. |
| Coorte e período | Escopo autorizado, critérios de entrada/saída e datas. |
| Evidência | Métricas, registros agregados, incidentes, feedback estruturado e limitações. |
| Resultado | Confirmada, refutada, inconclusiva ou interrompida; nunca “sucesso” sem critério. |
| Decisão | Manter, ajustar, pausar, retirar ou preparar nova validação. |
| Impacto estratégico | Requisito, critério de aceite, risco, owner, prioridade ou documento que foi atualizado. |
| Próxima prova | Lacuna concreta, responsável e gate para reabertura. |

## Referências internas

[1] [Matriz mestre estratégica — Vendas Urbanas e Locação](matriz_mestre_estrategica_vendas_locacao.md)

[2] [Inteligência, métricas, automação e canais](caderno_inteligencia_metricas_canais_vendas_locacao.md)

[3] [Jornadas operacionais — Vendas Urbanas e Locação](caderno_jornadas_operacionais_vendas_locacao.md)

[4] [Estratégia financeira — Vendas Urbanas e Locação](caderno_financeiro_vendas_urbanas_locacao.md)
