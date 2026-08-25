# Consolidação — auditoria aprofundada do curso em dez ciclos

> **Referência de revisão:** 25 de agosto de 2026.  
> **Regra de leitura:** o curso enviado é material de formação e hipótese de desenho. Uma decisão só entra na estratégia após confronto com fonte primária, documentação técnica atual, cenário de exceção e critério de teste. O encadeamento de fontes está no [caderno de evidências](crm_auditoria_curso_10_ciclos_evidencias.md). [1]

## Parecer executivo

O curso fornece uma base didática útil para separar domínio, aplicação, infraestrutura, dados, segurança, financeiro, API e operação. A auditoria confirma a direção, mas altera a forma de implementação: o CRM não será uma coleção de tabelas com telas, nem um conjunto de microserviços prematuros, e tampouco um ERP, banco, escritório fiscal ou parecer jurídico. A primeira arquitetura é um **monólito modular com Postgres autoritativo**, políticas verificáveis, comandos transacionais, fatos versionados, inbox/outbox, jobs rastreáveis e fronteiras explícitas com parceiros habilitados. [1]

| Eixo | O que foi preservado do curso | O que a auditoria tornou obrigatório |
| --- | --- | --- |
| Arquitetura e DDD | Contextos, camadas, agregados e linguagem de domínio. | Fronteiras de ownership antes de serviços de rede; agregado pequeno; contrato de entrada/saída; ADR para extração física. |
| Dados e temporalidade | Constraints, histórico e migrations. | Invariante no mecanismo adequado; versão de regra/termo; expandir–migrar–reconciliar–contrair; compensação em vez de apagar fato econômico. |
| Loteadora e contratos | Empreendimento, lote, contrato, parcela, garantia e distrato. | Estados ortogonais, alocação temporal, quadro-resumo imutável, gates de evidência e revisão habilitada. |
| Segurança e login | Multi-tenancy, RLS, MFA, RBAC/ABAC e auditoria. | Membership vivo, escopo/tempo/finalidade, RLS/grant/RPC/Storage testados, recuperação restrita e bootstrap sem backdoor. |
| Financeiro e split | Parcelas, correção, distribuição, comprovante, fiscal e área do contador. | Subledger por fato; comprovante distinto de conciliação/liquidação; direito distinto de instrução/settlement; regra e cálculo versionados. |
| API, qualidade e escala | REST, webhooks, jobs, testes, logs e performance. | OpenAPI/contrato, outbox/inbox, correlação, job com owner, SLI/SLO por jornada, teste de falha e plano de capacidade medido. |

## Dez ciclos, uma linha de decisão

| Ciclo | Pergunta auditada | Decisão consolidada | Prova antes de promoção |
| ---: | --- | --- | --- |
| 1 | Onde a regra de negócio vive? | Domínio modular e comando transacional; interface não decide política crítica. | Teste de invariante e contrato do contexto. |
| 2 | Como manter dado correto no tempo? | Facts, versões, constraints, concorrência explícita e migrations compatíveis. | Concorrência, `40001`, backfill e reconciliação. |
| 3 | Como isolar empresas, SPEs e pessoas? | Identidade separada de membership; menor privilégio em banco. | Suíte allow/deny para tabela, view, RPC, arquivo, URL e exportação. |
| 4 | Como representar loteadora sem simplificação falsa? | Estados urbanístico, registral, obra, comercial, alocação e carteira são independentes. | Reserva/venda concorrente e regra de elegibilidade com evidência. |
| 5 | Como registrar dinheiro e distribuição? | Evento, direito, instrução, retorno, settlement e conciliação são fatos distintos. | Duplicata, parcialidade, recebedor bloqueado, reversão e soma de direitos. |
| 6 | Como lidar com fiscal/contábil? | Classificação/versionamento/exportação; CRM organiza e explica, profissional habilitado valida e transmite. | Fechamento por competência, amostra reconciliada, lote imutável e retificação rastreável. |
| 7 | Como autenticar e recuperar sem escalar privilégio? | Convite/SSO/passkey conforme contexto, MFA por risco, sessão e recuperação restrita. | Reset, perda de fator, revogação, convite repetido e SSO indisponível. |
| 8 | Como integrar sem efeito repetido? | API contratada; outbox/inbox; adapter por parceiro; chave de idempotência e reconciliação. | Timeout, replay, callback fora de ordem, erro parcial e reprocessamento. |
| 9 | Como descobrir falha sem vazar dados? | Audit event de domínio separado de telemetria minimizada; SLI/SLO e runbook por jornada. | Alerta acionável, correlação, reprodução sintética e postmortem. |
| 10 | Como crescer sem perder controle? | Índice e job só após medição; paginação/cursor, capacidade por jornada e release progressivo. | `EXPLAIN` representativo, carga sintética, restore e orçamento de fila/Storage/pool. |

## Decisões de implementação que passam a ser vinculantes

O P0 começa pela constituição administrativa, identidade, organização, RLS, evidência e comando seguro. Em seguida, o núcleo comercial e de loteadora pode evoluir sobre objetos cuja autoria, escopo e estado são claros. O financeiro só entra com subledger, regra congelada, separação de deveres, testes de conservação, parceiro habilitado e workspace de exceção; uma interface de cobrança não prova liquidação nem substitui conciliação.

| Área | Regra vinculante | Antipadrão recusado |
| --- | --- | --- |
| Reserva e proposta | `expected_version` ou constraint adequada, transação curta e resposta explicável ao conflito. | Atualizar coluna de status diretamente ou repetir comando após timeout. |
| Contrato e distrato | Termos assinados/snapshot, parâmetro datado, memória de cálculo, revisão e fato compensatório. | Percentual legal/contratual hardcoded, reescrita de histórico ou decisão jurídica automática. |
| Dinheiro e split | Decimal determinístico; `EconomicEvent → Entitlement → PaymentInstruction → Settlement`; alçada e reconciliação. | Confundir cálculo com pagamento, comprovante com liquidação ou callback com fechamento contábil. |
| Fiscal e exportação | Taxonomia e regra versionadas; lote de exportação imutável e retorno reconciliável. | Alíquota/regime no código, transmissão automática sem responsável ou edição do passado para fechar divergência. |
| Login e administração | Convite/provisionamento governado, MFA/step-up, sessão revogável, suporte JIT e audit event. | E-mail/cargo como autorização, Super Admin oculto, credencial no frontend ou recuperação que preserva privilégio. |
| Integração e jobs | Outbox na mesma transação do fato; inbox, retry seguro, dead-letter/exceção e owner. | Chamar parceiro dentro da transação ou afirmar sucesso no browser antes de resultado confirmado. |
| Operação e escala | Métrica de jornada, telemetria sem segredo, capacidade testada e rollback/compensação separados. | Alertar por ruído, indexar sem plano ou declarar SLA sem restore/carga. |

## Conflitos mantidos abertos por design

Nem toda divergência pode ser resolvida por código. A estratégia preserva os pontos abaixo como decisões dependentes de contrato, localidade, regime, parceiro, ambiente e piloto; não há configuração “padrão” que os elimine.

| Tema | Por que não há regra universal | Dono de decisão | Evidência mínima exigida |
| --- | --- | --- | --- |
| Distrato, índice, juros e restituição | Variam por instrumento, versão, posse, empreendimento e interpretação aplicável. | Jurídico + controladoria. | Termo efetivo, cronologia, memória e aprovação. |
| Split com até 100 recebedores | Capacidade, KYC, base, tarifa, parcelamento, estorno e prazo variam por parceiro/contrato. | Tesouraria + parceiro habilitado. | Matriz de capacidade, sandbox, contrato e reconciliação. |
| CBS/IBS e obrigação acessória | Transição, regime, operação, documento e orientação mudam por período e contribuinte. | Contador/fiscal. | Regra datada, classificação, amostra e retorno oficial. |
| Autenticação e SSO | IdP, maturidade da organização, risco e disponibilidade de método variam. | Segurança + organização cliente. | Política, teste de convite/revogação, recovery e auditoria. |
| Escala e runtime | Volume, consulta quente, custo, região e limite do parceiro são empíricos. | Engenharia + operação. | Plano de execução, carga representativa, SLO e plano de capacidade. |

> **Limite de responsabilidade:** a estratégia especifica o sistema de fatos, políticas, evidências, exceções e integrações. Ela não entrega aconselhamento jurídico, fiscal, contábil, bancário ou de compliance para uma situação individual, nem autoriza execução financeira sem parceiro habilitado e validação contextual.

## Backlog derivado da auditoria

| ID | Requisito adicional | Prioridade | Critério de aceitação |
| --- | --- | --- | --- |
| CUR-01 | Modelo de estado de evidência de pagamento e conciliação. | Fundação financeira | `proof_submitted`, `recorded`, `matched`, `settled`, `reversed` e `disputed` não são colapsados; toda transição tem fonte, ator e correlação. |
| CUR-02 | Motor de regra financeira/contratual datada e reproduzível. | Fundação financeira | Cálculo aponta versão, parâmetros, base, índice, arredondamento, termo e memória; retificação é evento novo. |
| CUR-03 | Exportação fiscal classificatória com lote imutável. | Alta | Contratação, competência, vencimento e liquidação permanecem distintos; lote tem checksum, retorno, divergência e responsável de transmissão. |
| CUR-04 | Contrato de parceiro por capacidade e versão de API. | Fundação bloqueadora | Cada adapter declara autenticação, payload, idempotência, webhook, limites, KYC, estado, retenção, erro e saída; documentação descontinuada bloqueia go-live. |
| CUR-05 | Catálogo de jobs e exceções operáveis. | Fundação | Cada job tem owner, entrada redigida/versionada, lease, tentativa, prazo, cancelamento, artefato protegido, saída e reconciliação. |
| CUR-06 | Orçamento de performance por jornada autorizada. | Alta | Consulta quente é medida com RLS/dados representativos; índice guarda hipótese/plano/resultado; exportação e reconciliação não dependem do request web. |
| CUR-07 | Gate de aceitação por cenário de falha. | Fundação bloqueadora | Financeiro, acesso, migration, callback, arquivo e exportação só avançam com teste de duplicata, atraso, negação, concorrência, reversão e recuperação. |

## Fonte de verdade e reabertura

Este documento consolida a auditoria do curso e aponta para o caderno detalhado. A estratégia consolidada mantém a tese de produto, a arquitetura mantém limites de runtime e dados, e o backlog mantém critérios de implementação. Uma conclusão deve ser reaberta quando mudar uma fonte normativa, uma versão de API, uma política de plataforma, um contrato de parceiro, a capacidade demonstrada em sandbox ou uma métrica de piloto.

## Referências

[1] [Caderno de evidências — auditoria do curso em dez ciclos](crm_auditoria_curso_10_ciclos_evidencias.md)
