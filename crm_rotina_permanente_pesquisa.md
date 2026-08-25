# Rotina permanente de pesquisa contínua do CRM

## 1. Missão e limite de promessa

Esta rotina transforma pesquisa em uma capacidade permanente do futuro CRM, e não em uma coleção de documentos. Ela existe para descobrir lacunas, confrontar evidências, priorizar riscos e converter somente achados verificáveis em decisões de produto, arquitetura, configuração ou piloto.

> **Princípio central:** o objetivo é reduzir incerteza, erro previsível e retrabalho. Não existe promessa séria de risco zero, execução perfeita ou substituição do julgamento de contador, jurídico, fiscal, DPO, parceiro de pagamento, banco, instituição de pagamento ou responsável técnico habilitado.

## 2. Hierarquia de trabalho

| Nível | Artefato | Pergunta que responde | Saída permitida |
| --- | --- | --- | --- |
| 0 | Fonte preservada | O que foi efetivamente publicado, observado ou contratado? | Evidência com escopo, data e limitação. |
| 1 | Nota analítica | O que a fonte sugere para uma jornada específica? | Hipótese, contraponto e pergunta de piloto. |
| 2 | Registro de risco | O que pode falhar, vazar, divergir ou gerar perda? | Classe de falha, impacto, owner e prova necessária. |
| 3 | Decisão revisável | O que será adotado agora, onde e sob qual condição? | Requisito, gate, configuração ou experimento versionado. |
| 4 | Prova operacional | A decisão funcionou sob caso real, exceção e retorno? | Resultado, incidente, ajuste ou reversão. |

Nenhuma camada substitui a outra. Uma referência de fornecedor, fórum ou comunidade pode iniciar uma hipótese, mas não cria uma regra financeira, fiscal, jurídica, de acesso ou de pagamento sem a revisão proporcional ao risco definida no `crm_protocolo_revisao_viva.md`.

## 3. Fila permanente e prioridades

| Prioridade | Frente | Pergunta-guia | Gate mínimo |
| --- | --- | --- | --- |
| P0 | Financeiro, cobrança, liquidação e split | Um recebimento, direito, exceção e repasse continuam explicáveis ponta a ponta? | Contrato/política versionada, cenário de falha, reconciliação e parceiro habilitado. |
| P0 | Segurança, acesso, proteção e recuperação | Uma pessoa só enxerga, altera, exporta ou aprova o que pode provar? | RLS/policy, alçada, teste permitir/negar, log e reversão segura. |
| P1 | Loteadora, carteira e pós-entrega | Gleba, lote, contrato, obra, recebível, permuta e distrato preservam seus estados próprios? | Máquina de estados, vínculo de evidência e piloto por empreendimento. |
| P1 | Setores, papéis e workspaces | A tarefa chega à área correta sem transformar vínculo em credencial? | Owner, escopo, vigência, handoff e recertificação. |
| P1 | Integração e confiabilidade | Evento externo pode repetir, atrasar, falhar ou divergir sem perder o fato? | Contrato, inbox/outbox, idempotência, fila de exceção e reconciliação. |
| P2 | Concorrência, comunidades e demanda | O problema é recorrente, relevante e confirmado fora do marketing do fornecedor? | Duas fontes ou piloto, limitação registrada e hipótese explícita. |
| P2 | Gráficos, UX e IA | A interface torna o risco, a evidência e a próxima ação mais claros? | Pergunta de decisão, contraste, estado não cromático, fonte e revisão humana. |

## 4. Formato obrigatório de cada ciclo

Cada ciclo de estudo deve abrir e fechar um registro `ResearchCycle` com os seguintes campos:

| Campo | Obrigatório | Regra |
| --- | --- | --- |
| `cycle_id`, data e autor | Sim | Nunca sobrescrever o histórico. |
| Pergunta e prioridade | Sim | A pergunta deve apontar uma jornada, risco ou decisão concreta. |
| Fontes e classificação | Sim | Registrar origem, data, escopo, método e limitação. |
| Contraponto e cenário de exceção | Sim | Procurar condição em que a conclusão deixa de valer. |
| Impacto e owner | Sim | Indicar domínio, setor e responsável pela próxima revisão. |
| Proposta e não-decisão | Sim | Separar o que muda do que ainda depende de piloto/especialista. |
| Prova, teste ou pergunta de piloto | Sim | Toda proposta relevante precisa ser falsificável. |
| Próximo risco prioritário | Sim | A fila continua ordenada; não há “fim” informal do estudo. |

## 5. Tratamento de concorrência e comunidades

Referências públicas de CRM, páginas comerciais, changelogs, fóruns, issues, comunidades de desenvolvedores e relatos de operação entram como **sinal**, não como verdade de produto. O filtro obrigatório é: recorrência, contexto, evidência de causa, aplicabilidade para imobiliária/loteadora brasileira, impacto de não resolver, custo de resolver e possibilidade de validar em piloto.

Relatos de erro nunca devem levar à cópia de código ou configuração sem verificar versão, fornecedor, contrato, modelo de dados, política de acesso e superfície de ataque. Quando a solução depende de biblioteca, API ou plataforma, a documentação oficial vigente prevalece sobre snippets ou respostas comunitárias.

## 6. Rigor reforçado para financeiro e split

O estudo de pagamentos e split deve começar pelo fato econômico, pelo contrato e pela configuração versionada de direitos; nunca pelo layout de uma tela ou pela capacidade de um provedor. Para cada novo desenho, a rotina deverá testar, no mínimo, entrada, parcela, alteração contratual, recebimento parcial, pagamento em duplicidade, atraso, estorno, distrato, permuta, bloqueio de recebedor, divergência de retorno, falha de callback, reprocessamento e fechamento por competência.

> **Fronteira de responsabilidade:** o CRM deve orquestrar contexto, configuração, evidência, elegibilidade e reconciliação. A movimentação efetiva de recursos, a regulação de pagamentos, a escrituração, a apuração e a decisão profissional permanecem nos parceiros e profissionais responsáveis.

## 7. Cadência e continuidade

| Ritual | Resultado | Dependência |
| --- | --- | --- |
| Triagem recorrente | Novas fontes e problemas classificados na fila | Fonte acessível e registro de evidência. |
| Ciclo aprofundado P0 | Decisão, teste ou pergunta de piloto em financeiro/split e proteção | Revisão financeira, jurídica, fiscal e de parceiro quando aplicável. |
| Revisão transversal | Conflitos entre domínio, arquitetura, UX, segurança e operação expostos | Owners dos domínios afetados. |
| Relatório de mudança | O que mudou, por quê, risco residual e próximo gate | Decisão ou hipótese identificável. |
| Auditoria de vigência | Itens sem fonte atual, owner, prova ou revisão são reabertos | Histórico de ciclos e backlog. |

Foi solicitada uma cadência temporária de sete horas. A ativação automática depende de publicação do projeto; enquanto isso não ocorre, esta carta preserva a ordem, o estado e a retomada do trabalho sem representar uma automação como ativa quando não está.

## 8. Critério de encerramento de um tema

Um tema não é considerado “concluído” apenas porque recebeu pesquisa. Ele pode ficar em um dos estados abaixo:

| Estado | Definição |
| --- | --- |
| `catalogado` | Evidência ou problema registrado, sem decisão proposta. |
| `em_confronto` | Há fontes divergentes, contexto incompleto ou dependência externa. |
| `pronto_para_piloto` | Hipótese, owner, critério e risco estão claros. |
| `adotado_com_gate` | Entrou em estratégia/backlog com teste e responsável. |
| `suspenso` | Não é prioritário ou depende de condição ainda indisponível. |
| `reaberto` | Mudança de fonte, incidente, contrato, plataforma ou piloto alterou a conclusão. |

## 9. Artefatos que a rotina mantém

| Tipo | Artefatos principais |
| --- | --- |
| Estratégia | `estrategia_crm_imobiliario_consolidada.md`, `crm_roteiro_desenvolvimento.md` e protocolo de revisão viva. |
| Financeiro | Domínio de recebíveis, distribuição, subledger, área do contador e arquitetura de cobrança/split. |
| Plataforma | Arquitetura Netlify + Supabase, matriz de prontidão, fluxos, gates e runbooks. |
| Qualidade | Catálogo de falhas, controles anti-erro, relatórios de incidente e backlog ENG/AUD/PLAT/COMP/UX. |
| Evidências | Cadernos de fontes por tema, sempre com data, limitação e revisão planejada. |

## 10. Próxima decisão da rotina

A próxima rodada prioritária será a revisão aprofundada de **cobrança, liquidação, eventos de pagamento, distribuição configurável e reconciliação de exceções para loteadoras**, porque concentra impacto econômico, operacional, regulatório e reputacional. A pesquisa deve procurar fontes oficiais e técnicas de parceiros de pagamento, reguladores e documentação de integração; qualquer conclusão de implementação deve permanecer configurável e sujeita a homologação contextual.
