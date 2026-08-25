# Fila permanente de pesquisa, decisão e auditoria do CRM

## 1. Regra de organização

Os 61 artefatos atuais foram agrupados por **função de decisão**, e não apenas por assunto. Um arquivo pode permanecer como referência detalhada, mas a fila usa uma única pergunta prioritária por vez para impedir que a estratégia se transforme em acervo sem consequência.

| Camada | Artefatos principais | Papel na fila |
| --- | --- | --- |
| Norte canônico | `estrategia_crm_imobiliario_consolidada.md`, `crm_modelo_canonico.md`, `crm_roteiro_desenvolvimento.md`, `crm_protocolo_revisao_viva.md` | Decide linguagem comum, prioridade, gate e fonte de verdade estratégica. |
| Financeiro e distribuição | `estrategia_nucleo_financeiro_crm.md`, `arquiteturas_cobranca_split.md`, `pesquisa_split_pagamentos.md`, `crm_loteadora_recebiveis_distribuicao.md`, `crm_subledger_imobiliaria.md`, `crm_area_contabilidade_integracoes.md` | P0: controla fato econômico, configuração, exceção, retorno e fechamento. |
| Loteadora e carteira | `crm_dominio_loteadora.md`, `loteadora_pesquisa_externa.md`, `crm_loteadora_recebiveis_distribuicao.md` | P1: mantém estados de gleba, lote, obra, contrato, carteira, permuta e pós-entrega. |
| Pessoas, cadastro e organização | `crm_nucleo_cadastral_carteira.md`, `crm_dominio_organizacional.md`, `crm_governanca_organizacional.md`, cadastros e validações correlatas | P1: separa parte, vínculo, poder, escopo, acesso, documento e retenção. |
| Plataforma e confiabilidade | arquitetura Netlify + Supabase, fluxos, gates, runbooks, prontidão e evidências | P0: protege ambiente, mudança, RLS, evento, fila, recuperação e observabilidade. |
| Qualidade e segurança | catálogo anti-erro, controles, evidências e relatórios de incidente | P0: transforma falhas previsíveis em teste, alerta, contenção e aprendizagem. |
| Concorrência e mercado | benchmark de CRM, análises, evidências, diferenciais e backlog COMP | P2: identifica expectativa de mercado, sem confundir marketing com prova de produto. |
| Experiência e visualização | sistema visual, metodologia, evidências e UX | P2: torna risco, evidência e ação legíveis sem perder acessibilidade. |
| Auditoria | metodologia, inventário, evidências e relatório de auditoria | Transversal: aponta conflito, dono ausente, fonte vencida ou gate não provado. |

## 2. Fila inicial ordenada por risco

| Rank | Pergunta de pesquisa | Risco de não responder | Evidência e prova de saída |
| --- | --- | --- | --- |
| 01 | Como representar direito econômico, instrução, liquidação, repasse e exceção sem duplicar ou antecipar um pagamento? | Perda financeira, divergência com parceiro, falha de conciliação e reputação. | Modelo de estados, idempotência, cenários de retorno, reconciliação e homologação de parceiro. |
| 02 | Como permitir até cerca de 100 recebedores com gatilhos, base, prioridade, vigência e correção sem tornar uma regra de contrato irreversível? | Distribuição incorreta, litígio contratual, retrabalho contábil e tentativa de “consertar” o passado. | Política versionada, cascata explicável, simulação, aprovação e lançamento corretivo. |
| 03 | Como testar isolamento de organização/SPE/carteira/documento/exportação em todas as superfícies do produto? | Vazamento de dados, acesso indevido e auditoria incompleta. | Matriz RLS permitir/negar, teste automatizado e recertificação de acesso. |
| 04 | Como tratar callback repetido, atraso, assinatura inválida, retorno parcial e indisponibilidade de parceiro? | Dupla aplicação, saldo falso, operação parada e divergência de caixa. | Inbox/outbox, deduplicação, fila de exceção, replay controlado e reconciliação. |
| 05 | Como separar inventário, contrato, carteira, obra, permuta e distrato na loteadora sem criar estados contraditórios? | Venda indevida, perda de rastreabilidade e distorção da carteira. | Máquina de estados por objeto, invariantes e piloto de empreendimento. |
| 06 | Como entregar workspaces por setor sem tratar vínculo societário, parceiro ou colaborador como acesso automático? | Exposição indevida, handoff manual e perda de accountability. | Matriz papel–escopo–alçada–vigência e teste de autorização. |
| 07 | Quais dores são comprovadas em piloto, concorrente e comunidade — e quais são apenas ruído de marketing ou relato isolado? | Backlog reativo e cópia de solução inadequada. | Recorrência, fonte, contexto, limitação e pergunta de piloto. |
| 08 | Quais gráficos e alertas tornam uma exceção financeira acionável sem induzir decisão errada? | Painel bonito, mas incapaz de explicar risco, base ou próxima ação. | Pergunta decisória, fonte, recorte, estado não cromático e teste de compreensão. |

## 3. Critério de priorização

Cada item recebe as notas `impacto`, `probabilidade`, `irreversibilidade`, `dependência externa`, `sensibilidade de dados` e `potencial de aprendizagem em piloto`. O score não substitui julgamento: um item com risco regulatório, econômico ou de acesso pode permanecer P0 mesmo com baixa frequência observada.

## 4. Lacunas explícitas que não devem ser escondidas

| Lacuna | Estado atual | Próximo passo correto |
| --- | --- | --- |
| Contratos reais de parceiros de cobrança/pagamento | Não anexados à estratégia. | Obter documentação e sandbox do parceiro escolhido; não inferir campos, limites ou garantias. |
| Casos reais anonimizados de loteadora e imobiliária | Ainda dependentes de pilotos. | Modelar cenários com responsáveis e critérios de aceite antes de generalizar. |
| Política contratual/fiscal por empresa e empreendimento | Variável por contrato e contexto. | Revisar com jurídico, fiscal e contador habilitados; manter configuração e vigência. |
| Métricas de uso e incidente em produção | Produto ainda estratégico, sem telemetria real. | Definir eventos, SLOs e linha de base antes de qualquer promessa de desempenho. |
| Concorrência em comunidades | Fontes comunitárias não são prova de produto. | Classificar relato, reproduzir o problema e confrontar com documentação/operador. |

## 5. Próxima execução da fila

O ciclo imediato será **FIN-SPLIT-01**: reavaliar o desenho de evento econômico, direito configurável, instrução, retorno, exceção e correção para um recebimento de loteadora com múltiplos recebedores. A revisão deve registrar onde uma plataforma de pagamento termina, onde o CRM começa e quais afirmações exigem validação do parceiro, do jurídico, do fiscal e da contabilidade.
