# Evidências — auditoria do curso em dez ciclos

> **Referência de pesquisa:** 25 de agosto de 2026.  
> **Leitura:** fontes primárias/documentação técnica; o curso enviado é hipótese de partida e não fonte externa de validação.

## Ciclos 1 e 2 — arquitetura, domínio, dados e temporalidade

| Achado | Evidência | Decisão para a estratégia | Limite e teste obrigatório |
| --- | --- | --- | --- |
| Domínio deve orientar fronteiras, mas DDD não exige transformar cada contexto em serviço distribuído desde P0. | A análise de domínio recomenda limites por capacidade de negócio, coesão e contexto delimitado; a orientação tática adverte para agregados pequenos e consistência local. [1] [2] | Manter um modular monolith lógico sobre Supabase/Postgres no P0, com context map, ownership e contratos; extrair runtime somente se autonomia/carga/propriedade medida justificar. | Testar contexto por contrato de entrada/saída e proibir dependência circular; ADR deve explicar qualquer nova fronteira física. |
| O agregado é fronteira de invariantes, não sinônimo de tabela, microserviço ou grafo inteiro. | A orientação tática define aggregate como fronteira de consistência, recomenda agregados pequenos e referências por identidade. [2] | Modelar `Contrato`, `Reserva de lote`, `Plano de distribuição` e `Caso de acesso` como fronteiras de decisão curtas; relacionar outros agregados por ID e evento/outbox. | Concorrência deve provar que uma reserva/contrato/direito não obtém efeito duplo; operação interagregado usa estado explícito e reconciliação. |
| O curso acerta ao separar UI, aplicação, domínio e infraestrutura, mas a camada de aplicação não pode esconder política de autorização nem transação sem rastreio. | A camada de domínio não deve depender de apresentação/infraestrutura e a aplicação orquestra, sem deter regra de negócio. [3] | Preservar domínio testável e adapters finos; decisões críticas executam RLS/RPC/função transacional server-authoritative, com audit event e correlação. | Nenhuma tela, DTO ou service role substitui RLS, grant, policy ou validação de estado no banco. |
| `CHECK` não garante regra que depende de outras linhas/tabelas; constraints são essenciais, porém devem ser escolhidas pela semântica. | PostgreSQL alerta que `CHECK` deve referir-se à linha e sugere `UNIQUE`, `EXCLUDE`, `FOREIGN KEY` ou trigger para restrições entre linhas/tabelas. [4] | Usar `NOT NULL`, FK, `UNIQUE`, `EXCLUDE`, índices parciais e constraints nomeadas para integridade declarável; regras cruzadas seguem RPC/transação curta/lock ou serialização. | Migration inclui teste de violação para cada invariante; não usar função mutável ou lookup de outra tabela em `CHECK`. |
| Serializabilidade ajuda em anomalias complexas, mas exige retry da transação inteira; retry não pode cruzar efeito externo. | PostgreSQL descreve o isolamento `SERIALIZABLE`, falhas `40001` e a necessidade de reiniciar a transação; o padrão de eventos destaca idempotência para consumidores ao menos uma vez. [5] [6] | Para reserva, alçada e cálculo financeiro: definir versão/constraint e transação curta; em conflitos, repetir apenas o trecho interno elegível. Todo efeito externo passa por outbox/inbox, chave estável e reconciliação. | Timeout, `40001`, clique duplo, duplicata e callback fora de ordem precisam de fixture e teste; nunca repetir pagamento, assinatura ou exportação cegamente. |
| Histórico e auditabilidade não significam aplicar event sourcing a todo o CRM. | Event sourcing melhora reconstrução e auditabilidade, mas introduz custo em evolução, projeções, privacidade e consistência eventual; a fonte recomenda adoção seletiva. [6] | Manter estado relacional canônico com audit event append-only, snapshots de contrato e ledger/domínio onde a reversibilidade importa; adotar event stream somente por decisão documentada. | Fatos econômicos não são apagados; correção é evento compensatório/retificação. PII não entra em log/evento imutável sem arquitetura de retenção e proteção aprovada. |
| Migration operacional é um processo, não um script isolado. | O padrão expand–migrate–contract separa mudança de schema/código, backfill, migração de leitura/escrita e remoção após observação. [7] | Formalizar migrations P0 como **expandir → validar/dual-write quando aplicável → backfill idempotente → reconciliar → migrar leitura → contrair**; policy/grant/teste acompanham a mudança. | Não há `DROP`, renomeação ou alteração destrutiva sem inventário de dependências, backup/restore ensaiado, métrica de reconciliação e plano de compensação. |

## Contrapontos que alteram o curso

| Posição do curso | Conclusão da auditoria |
| --- | --- |
| “DDD + contextos delimitados” | Confirmado, com ressalva: limites são de linguagem/ownership antes de serem serviços de rede. O P0 favorece modularidade explícita e teste de contrato, não microserviços prematuros. |
| “Constraints são última linha de defesa” | Confirmado, com precisão: constraint só prova a propriedade que ela expressa. Invariante entre linhas, decisão de autorização e efeito externo exigem mecanismo complementar e teste. |
| “Histórico/snapshot imutável” | Confirmado para contrato, direito, cálculo e auditoria, mas sem event sourcing universal. Retenção, PII, direito de correção e complexidade de replay precisam de decisão por contexto. |
| “Migration reversível” | Refinado: reversão de app, schema, dados e efeito de domínio são operações diferentes. Fato econômico/jurídico não é “rollback”; é compensação rastreável. |

## Ciclo 4 — domínio imobiliário, loteamento, contrato e máquina de estado

| Achado | Evidência | Decisão para a estratégia | Limite e teste obrigatório |
| --- | --- | --- | --- |
| Loteamento é objeto urbano-regulatório antes de ser estoque comercial; município, aprovação, registro, infraestrutura, matrícula e restrições não podem ser reduzidos a um único `status`. | A Lei nº 6.766/1979 diferencia loteamento/desmembramento, vincula parâmetros ao planejamento municipal e impõe etapas/documentos de aprovação e registro. [8] | Confirmar estados paralelos de empreendimento e lote: urbanístico, registral, obra, comercial, alocação/ônus e carteira. O CRM aponta evidência e revisão; não conclui regularidade jurídica. | Um lote só se torna elegível comercialmente sob policy que exige os estados/evidências aplicáveis; RLS separa SPE/empreendimento e o gate registra responsável habilitado. |
| A regra “não vender duas vezes” deve combinar decisão atômica, versão/lock, constraint e expiração de reserva; uma coluna de estado isolada não descreve todo o conflito. | PostgreSQL documenta isolamento, `ON CONFLICT`, locks e necessidade de retry de transação após conflito; DDD recomenda consistência local do agregado. [2] [5] | `InventoryAllocation`/reserva vira agregado temporal com `expected_version`, razão, expiração e resultado. O lote preserva estados paralelos, e não alterna simplesmente entre “disponível/vendido”. | Duas sessões e duas integrações concorrentes tentam reservar/vender o mesmo lote; só uma comanda o efeito e a outra recebe conflito explicável, sem criar proposta/contrato residual. |
| Quadro-resumo é exigência informativa e fonte de interpretação contratual; ele precisa de versão assinada, campos estruturados e vínculo com a evidência, não de JSON opaco atualizado depois. | Lei nº 13.786/2018 inclui quadro-resumo em contratos de loteamento e detalha preço, pagamento, correção, consequências e requisitos de distrato. [9] | Armazenar `contract_terms_version` imutável, campos normalizados para cálculo, snapshot renderizável, hash/evidência e link de assinatura. Política atual não reescreve contrato já formado. | Cálculo consulta somente termos efetivos da versão assinada; alteração exige aditivo/versionamento e teste de reprodução do resultado histórico. |
| Os exemplos de 10%, 0,75% e 12 parcelas não são parâmetros universais livres para hardcode. | A Lei nº 13.786/2018 traz condições, limites, distinções e prazos específicos para distrato de loteamento, além de remeter a situação contratual e exceções. [9] | Converter distrato em caso de domínio: gatilho, fato, contrato, versão, posse, pagamentos, deduções, revisão jurídica/financeira, devolução, estado de estoque e evento compensatório. | O CRM gera memória de cálculo/proposta e bloqueia instrução externa enquanto requisito, aprovação, prova contratual e exceção não estiverem completos; não oferece parecer jurídico ou apuração definitiva. |
| “Uma garantia por contrato” é uma regra de locação com modalidade e exceções contextualizadas, não um padrão copiado automaticamente para todas as vendas. | A Lei nº 8.245/1991 lista modalidades de garantia locatícia e veda mais de uma no mesmo contrato de locação. [10] | Preservar `UNIQUE`/regra de domínio para garantia locatícia aplicável; contratos de venda, cessão, incorporação e parceiro usam modelos próprios, evidência e revisão. | Tentar ativar duas garantias locatícias vigentes no mesmo contrato deve falhar no banco/comando; modalidades históricas e substituição exigem transição, data e trilha. |

### Decisão de modelagem derivada

O curso usa `empreendimento → quadra → lote` e `contrato → parcela → garantia` como ensino inicial útil. A estratégia adota uma forma mais rigorosa: o lote continua entidade territorial, mas disponibilidade é consequência de **alocação comercial**, **restrição/ônus**, **reserva temporal**, **contrato**, **registro** e **carteira**, com fontes e vigências independentes. O contrato continua agregado de termos e fatos, porém garantia, assinatura, pagamento, distrato e instrução externa são casos com fronteiras explícitas e não simples alterações de coluna.

> **Limitação jurídica:** a plataforma organiza fatos, documentos, versões, alertas e revisão. A leitura de matrícula, elegibilidade registral, instrumento contratual, cálculo definitivo de distrato e orientação ao cliente pertencem aos profissionais e processos habilitados no caso concreto.

## Ciclos 3, 7 e 9 — multi-tenancy, identidade, autorização e confiabilidade

| Achado | Evidência | Decisão para a estratégia | Limite e teste obrigatório |
| --- | --- | --- | --- |
| `tenant_id` em toda tabela é necessário, mas não basta; policy, grant, view, RPC, Storage e função são superfícies independentes. | A documentação Supabase explica que grants decidem a operação e RLS decide as linhas; views podem burlar RLS por padrão e `service_role` a ignora. [14] | Manter organização/SPE/escopo como dados vivos de membership e policy no banco. Toda migration exposta inclui RLS, revogação de grants amplos, grants mínimos, policies por operação, testes e índice de filtro. | Exercitar leitura/escrita/arquivo/exportação/RPC para membro, não-membro, anon, sessão expirada e principal administrativo; uma tela escondida não conta como negação. |
| O curso acerta ao não aceitar `tenant_id` do browser, mas `current_setting('app.tenant_id')` não pode ser a única origem de verdade em runtime com pool/conexões. | RLS com `auth.uid()`/claims pode aplicar decisão no Postgres; a documentação alerta que `raw_user_meta_data` é editável e que JWT pode ficar desatualizado. [14] | Em Supabase, usar UUID autenticado, membership/escopo no banco e funções com validação explícita. Claims curtas podem carregar sinal de MFA; não carregar lista extensa de permissões/tenant no JWT. | Revogação de membership, escopo ou suporte JIT deve negar na próxima decisão server/database-authoritative, sem esperar UI ou confiar em metadata do usuário. |
| RBAC sozinho produz explosão de papel e não representa objeto, finalidade, tempo, risco ou relação. | OWASP recomenda menor privilégio, negação por padrão, validação por requisição e preferência por ABAC/ReBAC quando há lógica fina/multi-tenant. [12] | Papel-base só orienta o workspace; ABAC/ReBAC decide `organização + SPE + recurso + ação + finalidade + alçada + vigência + AAL`. Admin não é superusuário cego. | Cada matriz de permissão deve ter allow/deny e prova do recurso negado intacto; recertificação detecta privilege creep. |
| Autenticação, sessão e autorização são controles distintos; uma sessão herdada equivale ao poder do fator mais forte usado para criá-la. | OWASP descreve que o token liga autenticação, tráfego e acesso e deve ser renovado após aumento de privilégio/risco; recomenda cookies e proteção de ciclo de vida. [13] | Sessões em ações comuns usam política moderada; bootstrap, grants, exportação, banco, split e integração exigem step-up/AAL2, recência e revogação conforme risco. Recuperação abre sessão restrita. | Login, reset, mudança de fator, mudança de e-mail/IdP, grant e incidente rodam rotação/revisão de sessão; token não vai em URL, log ou PII. |
| Níveis de garantia são referência de engenharia, não certificação automática do CRM privado. | NIST SP 800-63B descreve AAL, step-up e opção resistente a phishing em AAL2, além de timeouts e gestão de eventos do autenticador. [11] | Aplicar AAL como vocabulário de risco: AAL1 para rotina limitada; AAL2/recent auth para administração, dado sensível e comando econômico. Oferecer método resistente a phishing quando viável e revisar passkeys/SSO por maturidade. | Não alegar conformidade NIST sem avaliação específica; medidas de risco não substituem fator/autenticação e devem ter avaliação de privacidade. |
| Audit event não substitui telemetria; logs técnicos não podem reter segredo ou dossiê. | OWASP pede logging apropriado de decisões de autorização; Supabase exige teste por operação e ressalta o efeito de grants/policy. [12] [14] | `AdminAuditEvent` e eventos de domínio guardam decisão, ator, alvo, motivo, antes/depois redigido e correlação; telemetria guarda saúde/release/trace minimizados e segregados. | Todo incidente material produz reprodução sintética, owner, sinal, mitigação, postmortem e regressão; nunca anexar segredo, token, documento ou dado bancário ao ticket/log. |

### Contrapontos que alteram o curso

| Posição do curso | Conclusão da auditoria |
| --- | --- |
| “RBAC e um pouco de ABAC” | Refinado para RBAC + ABAC/ReBAC + RLS/RPC. O papel é insuficiente para imobiliária, SPE, carteira, documento, finalidade e vigência. |
| “JWT/sessão + MFA” | Refinado para ciclo de identidade: convite/SSO, AAL, step-up, sessão, recuperação, rotação, revogação e auditoria. |
| “Admin vê tudo do tenant” | Recusado como regra geral. Admin é limitado por dever, finalidade, escopo e alçada; administrador de plataforma não herda dados da locatária. |
| “Trilha append-only” | Confirmado, separado de observabilidade e limitado por minimização/retencão. Append-only não é licença para reter PII/segredo indiscriminadamente. |

## Ciclos 9 e 10 — qualidade, observabilidade, operação e escala de risco

| Achado | Evidência | Decisão para a estratégia | Limite e teste obrigatório |
| --- | --- | --- | --- |
| Pirâmide de testes é ponto de partida; risco de negócio, não camada, deve determinar cobertura e gate. | O SSDF propõe práticas que reduzem vulnerabilidades e sua recorrência; Supabase exige testes allow/deny por operação de RLS. [14] [18] | Definir matriz de testes por invariante: unidade/propiedade para cálculo e estado; banco/RLS para isolamento; integração para outbox/idempotência; E2E para jornadas e recuperação; caos/reprodução para parceiros. | Nenhum item financeiro, identidade, migração, RLS, exportação ou split passa com “happy path” somente. O teste deve incluir duplicata, atraso, negação, concorrência, reversão e reprocessamento. |
| Métrica de infraestrutura não prova sucesso de negócio; monitoramento deve combinar caixa-preta, caixa-branca e reconciliação de domínio. | Google SRE distingue sinais externos/internos e propõe latência, tráfego, erros e saturação como cobertura mínima de serviço. [15] | Criar SLIs específicos: sucesso de comando, taxa de duplicata contida, atraso de outbox, divergência de conciliação, RLS deny esperado, frescor de índice, completude de exportação e recuperação de job. | Não alertar por todo ruído. Page exige sintoma urgente/acionável; ticket recebe tendência/degradação. Dashboard técnico não substitui painel de exceção operacional. |
| “Nunca falhar” é meta enganosa; disponibilidade, integridade, confidencialidade e tempo de recuperação têm tolerâncias diferentes. | A prática SRE recomenda risco explícito e objetivos por tipo de serviço, em vez de perseguir disponibilidade máxima indiscriminada. [16] | Definir SLO/erro tolerável por jornada: leitura pode degradar; comando financeiro deve falhar fechado; processamento fiscal/exportação deve ser assíncrono e recuperável; vazamento/violação de integridade tem tolerância zero operacional. | Release é bloqueado quando orçamento/gate de qualidade crítico está sob ameaça. SLO é proposto pelo produto/risco e revisado, não copiado de serviço global. |
| Trace, métrica e log só se correlacionam com vocabulário comum e limites de privacidade. | OpenTelemetry define convenções semânticas comuns para traces, métricas, logs, profiles e recursos. [17] | Padronizar `correlation_id`, `operation`, `tenant/spe` pseudonimizado quando necessário, release, adapter, resultado, erro classificado e latência; dados pessoais, token e documento ficam fora. | Todo alerta precisa apontar para correlação, runbook e owner. O evento deve permitir reprodução sintética sem exfiltrar o caso real. |
| CI não é apenas lint; segurança de código, dependência, configuração, revisão e vulnerabilidade recorrente precisam de processo. | SSDF existe para incorporar práticas de desenvolvimento seguro ao SDLC, reduzir vulnerabilidades e tratar causas-raiz. [18] | Gate de entrega combina typecheck, lint, testes, migrations, RLS, dependências, segredo, revisão humana de mudança crítica, feature flag, rollout, observação e plano de compensação. | Sem `code owner`/segunda revisão para segurança, financeiro, fiscal, identidade e migração. Todo incidente relevante abre teste regressivo e atualiza runbook/ADR. |

> **Síntese operacional:** em pagamento, distrato, distribuição, permissão, exportação e registro, o sistema deve preferir **parar com explicação**, preservar a prova e encaminhar a revisão a apresentar uma resposta rápida porém incorreta. A engenharia anti-erro é também uma disciplina de produto e operação.

## LGPD e PLD/COAF — controles transversais dos ciclos de acesso e operação

| Achado | Evidência | Decisão para a estratégia | Limite e teste obrigatório |
| --- | --- | --- | --- |
| Consentimento não é a base legal padrão para tudo o que existe em um CRM; finalidade, necessidade, transparência e registros de decisão precisam existir por atividade de tratamento. | A LGPD define princípios, hipóteses de tratamento, direitos, segurança, prevenção e prestação de contas. [19] | Criar inventário de tratamento: campo/documento, finalidade, base legal, controlador/operador, retenção, acesso, compartilhamento, risco e owner. Consentimento só aparece quando for a base apropriada e com prova/versionamento. | Formulário não coleta “por precaução”; solicitações de acesso/correção/eliminação passam por workflow com motivo de retenção, prazo, aprovação e recibo, não por `DELETE` direto. |
| Dados sensíveis, documentos e telemetria requerem compartimentos e minimização; anonimização/pseudonimização não é etiqueta superficial. | A LGPD classifica dados pessoais/sensíveis, define anonimização/pseudonimização e exige medidas técnicas e administrativas de segurança. [19] | Separar dossiê/documento sensível, CRM comercial, RH, logs e analytics; usar tokenização/redação nas visualizações e mínimos atributos para política/diagnóstico. | Testar exportação, busca, cache, log, anexos e suporte contra vazamento de CPF, dado bancário, saúde, biometria, token e documento. |
| PLD exige registro, monitoramento e comunicação dentro de processo sigiloso; o CRM pode apoiar fatos e workflow, mas não concluir suspeita nem enviar sozinho. | O COFECI informa obrigações setoriais de comunicação de não ocorrência, COS, manutenção de arquivo e sigilo da comunicação. [20] | Criar caso de compliance com regra/sinal, evidências, responsável habilitado, revisão, decisão, prazo, cadeia de custódia e acesso extremamente restrito. Comunicação externa é passo humano autenticado, com duas pessoas quando a política demandar. | A notificação ordinária nunca revela COS ao cliente/fluxo comercial. Dados de sinal não entram em CRM amplo, painel de vendedor, e-mail comum ou IA sem política aprovada. |

> **Limitação regulatória:** as fontes normativas mudam, contratos e fatos variam. A estratégia define capacidade, controles e evidências; contador, jurídico, DPO/encarregado, compliance e parceiro habilitado validam a aplicação no caso concreto e a obrigação acessória/comunicação externa.

## Ciclo 5 — financeiro, recebedores, split e limites de integração

| Achado | Evidência | Decisão para a estratégia | Limite e teste obrigatório |
| --- | --- | --- | --- |
| Regra de distribuição, instrução de pagamento, recebedor do parceiro e liquidação são objetos diferentes, com estados e evidências independentes. | A documentação de recebedores do Pagar.me descreve cadastro reutilizável, status operacionais e condição de conta/adquirência para split. [21] | O CRM mantém `DistributionPlan` versionado, cálculo, alçada, beneficiário e referência externa. O adapter cria/consulta recebedor e instrui o parceiro somente se status, KYC/credenciamento, contrato, aprovação e chave de idempotência forem elegíveis. | Nunca marcar `paid` por solicitação do usuário ou resposta de criação. Reconciliar o estado do parceiro por evento assinado/consulta idempotente e gerar exceção para `refused`, `suspended`, `blocked` ou divergência. |
| Uma tentativa de rede não pode duplicar transferência, cobrança, reembolso ou notificação. | A referência do parceiro descreve `Idempotency-Key` para repetir uma requisição sem executar a operação duas vezes, mas a própria página V4 avisa descontinuação. [22] | A chave do CRM é estável por comando/fato, persiste request hash, resposta, estado e correlação; o adapter documenta a semântica **da versão atual** do parceiro selecionado antes do go-live. | O teste repete comando/timeout/callback e comprova um único efeito econômico. A integração V4 não entra em arquitetura produtiva; qualquer fornecedor é intercambiável por porta/contrato interno. |
| “Controle only” é evidência útil de operação, mas comprovante anexado não é prova universal de liquidação bancária nem substitui conciliação. | O próprio material do curso diferencia anexo de comprovante e lançamento; integrações de recebedor expõem estados próprios do parceiro. [21] | Separar `proof_submitted`, `reviewed`, `recorded`, `matched`, `settled`, `reversed` e `disputed`, com origem do fato e confiança. Conciliação relaciona fonte bancária/parceiro a movimento, sem apagar divergência. | O estado “pago” de contrato depende da política configurada e da evidência mínima; tesouraria/contador pode reclassificar por evento compensatório, nunca sobrescrever história. |

> **Limite de produto:** o CRM calcula, versiona, evidencia, encaminha e reconcilia. A cobrança, custódia, KYC de recebedor, transferência e liquidação dependem de parceiro autorizado e da análise contratual, fiscal e de compliance aplicável.

## Ciclos 6 e 7 — fiscal, contábil, carteira e exportações

| Achado | Evidência | Decisão para a estratégia | Limite e teste obrigatório |
| --- | --- | --- | --- |
| Operação contratada e pagamento têm eixos temporais distintos, portanto não cabem em uma única data de “receita”. | O serviço oficial de DIMOB distingue operações de construção/incorporação/loteamento/intermediação no ano de contratação e pagamentos mensais de locação/sublocação/intermediação. [23] | Subledger preserva `contracted_at`, competência/fato, vencimento, recebimento/liquidação, documento, fonte e correção. A exportação é uma projeção versionada e reconciliável, nunca a única fonte de verdade. | Gerar amostra de DIMOB por operação e por pagamento, reconciliação com contrato/recebimento e arquivo de exceções. O CRM prepara dados; responsável autorizado confere e transmite pelo canal oficial. |
| CBS/IBS e demais regras transitórias tornam alíquota e classificação uma política datada, não lógica embutida no código. | Receita Federal informa cronograma de transição e a LC nº 214/2025 institui CBS/IBS e disciplina operações, inclusive bens imóveis/locação no texto legal. [24] [25] | Manter taxonomia de operação, regime, natureza, vigência, documento fiscal, fonte legal, decisão do contador e versão de regra. O engine calcula cenários/memórias somente sob configuração aprovada. | Todo resultado fiscal aponta versão de regra, dados de entrada, período e aprovador; alteração legal cria versão nova, nunca reprocessa silenciosamente histórico. |
| “Caixa versus competência” é visualização/relato que precisa ser definida por política contábil e fato de domínio, não simplesmente `vencimento` versus `pago`. | A DIMOB evidencia que contratação e pagamento obedecem recortes diferentes; a transição tributária diferencia momentos e condições de operações/pagamentos. [23] [25] | Separar movimentos econômicos, contas a receber, caixa/liquidação, competência reconhecida, conta contábil, classificação fiscal e ajuste. A área contábil tem exportação/explicação, não permissão para apagar fato operacional. | Fechamento mensal bloqueia período, registra ajuste/retificação com motivo e reconcilia subledger ↔ extrato ↔ exportação ↔ memória; divergência permanece como exceção atribuída. |
| Cálculo de juros, correção e distrato necessita precisão determinística, mas arredondamento deve ser definido no contrato/política e rastreado por versão. | As regras de quadro-resumo/distrato de loteamento dependem de termos, índices, valores e prazos versionados na Lei nº 13.786/2018. [9] | Usar decimal inteiro/escala fixa, calendário, fonte de índice, data-base, política de arredondamento e snapshot de termos. Fórmula gera memória auditável e não apenas valor final. | Teste de propriedades cobre saldo não negativo, conservação do total, reprodutibilidade, mudança de índice, competência ausente, alteração de contrato e correção/compensação. |

### Contrapontos que alteram o curso

| Posição do curso | Conclusão da auditoria |
| --- | --- |
| “Parcela paga com comprovante” | Refinado: comprovante é uma classe de evidência; pagamento registrado, conciliado, liquidado e contabilizado podem ter estados diferentes. |
| “Caixa fiscal × competência contábil” | Confirmado como necessidades de visões distintas, mas o mapeamento final depende de fato, regime, política contábil/fiscal e validação habilitada. |
| “CBS/IBS como marcações” | Ampliado para regras com versão, vigência, fonte e aprovação. O CRM suporta classificação e memória, não substitui apuração/declaração profissional. |
| “Split calculado no recebimento” | Refinado: cálculo, aprovação, instrução, aceite do parceiro, liquidação e conciliação são eventos separados, com teto e compensação. |

## Ciclos 8, 9 e 10 — integrações, API, jobs, qualidade e escala

| Achado | Evidência | Decisão para a estratégia | Limite e teste obrigatório |
| --- | --- | --- | --- |
| Salvar o fato de domínio e publicar o evento externo são duas operações que podem falhar de forma independente. | O padrão Transactional Outbox persiste o objeto e o evento na mesma transação e usa worker para publicação/reprocessamento, reduzindo perda por falha entre commit e mensagem. [26] | Todo comando que dispara parceiro/exportação/notificação cria `outbox_event` na transação do fato. Worker idempotente entrega, registra tentativa/erro/correlação e deixa evento em exceção visível quando esgotar política. | Não usar “transação distribuída” nem chamar parceiro dentro da transação do Postgres. Testar queda após commit, duplicata, ordem por agregado, reprocessamento e inbox do consumidor. |
| API é contrato de produto e operação, não espelho de tabela. | OpenAPI descreve interface HTTP independente de linguagem e suporta documentação, geração, teste, segurança e componentes reutilizáveis. [29] | Publicar contrato versionado com recursos, schemas de comando/leitura, correlação, idempotency key, erros de negócio, paginação/cursor, limitação e depreciação. Adapter externo fica atrás de ACL/porta. | Mudança incompatível requer versão ou estratégia expand–migrate–contract; testes de contrato protegem consumidor e não expõem entidade interna, segredo ou permissão implícita. |
| Índice acelera leituras seletivas, mas cria custo de escrita, armazenamento e manutenção; performance deve ser medida pelo plano e pela jornada quente real. | PostgreSQL explica o uso de `EXPLAIN` para entender o plano e alerta que índices aceleram busca, porém adicionam overhead. [27] [28] | Manter catálogo de consultas quentes por jornada, tenant/SPE, filtro/ordem/paginação e política RLS. Índice só entra após hipótese, `EXPLAIN (ANALYZE, BUFFERS)` em ambiente representativo e métrica de regressão. | Não “indexar tudo”. Testes de performance abrangem RLS, dados representativos, exportação, reconciliação e jobs; query sem limite/cursor em carteira grande é defeito de design. |
| Trabalho pesado deve sair do request, mas assíncrono exige propriedade, status, prazo, retry, cancelamento e resultado governados. | O padrão outbox separa commit de worker, e SRE recomenda medir sucesso/falha de unidades de trabalho além de disponibilidade de request. [16] [26] | `JobRun` possui input versionado/redigido, owner, prioridade, idempotency scope, estado, prazo, tentativa, saída segura e artefato com acesso temporário. DIMOB, conciliação, recalculo, exportação e carga massiva usam esse caminho. | A UI não declara sucesso antes de resultado confirmado. Trabalho reexecutado deve ser seguro; cancelamento precisa definir se só interrompe fila ou exige compensação de efeitos já aplicados. |

### Decisões de escala por classe de risco

| Classe | Estratégia de resposta |
| --- | --- |
| Consulta operacional repetida | Cursor/paginação estável, filtros autorizados, índices medidos e projeção de leitura quando necessária. |
| Cálculo financeiro/distrato/split | Comando curto e serializável/versão quando aplicável, decimal determinístico, outbox somente após commit e memória reprodutível. |
| Exportação fiscal/arquivo massivo | Job idempotente, snapshot de parâmetros, artefato protegido, checksum, reconciliação e retenção. |
| Webhook de parceiro | Verificação de autenticidade conforme contrato, inbox/deduplicação, ordem quando relevante, estado de exceção e reconciliação por consulta. |
| Migração/retroprocessamento | Expandir–migrar–reconciliar–contrair, lotes monitorados, limite de carga, rollback de aplicação e compensação de domínio. |

## Referências

[1] [Microsoft — Use domain analysis to model microservices](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis)

[2] [Microsoft — Use tactical DDD to design microservices](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/tactical-domain-driven-design)

[3] [Microsoft .NET — Design a DDD-oriented microservice](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice)

[4] [PostgreSQL — Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

[5] [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)

[6] [Microsoft — Event Sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)

[7] [PlanetScale — Backward compatible database changes](https://planetscale.com/blog/backward-compatible-databases-changes)

[8] [Planalto — Lei nº 6.766/1979, Parcelamento do Solo Urbano](https://www.planalto.gov.br/ccivil_03/leis/l6766.htm)

[9] [Planalto — Lei nº 13.786/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13786.htm)

[10] [Planalto — Lei nº 8.245/1991, Locações Urbanas](https://www.planalto.gov.br/ccivil_03/leis/l8245.htm)

[11] [NIST — SP 800-63B, Authentication and Authenticator Management](https://pages.nist.gov/800-63-4/sp800-63b.html)

[12] [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

[13] [OWASP — Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

[14] [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

[15] [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)

[16] [Google SRE — Embracing Risk](https://sre.google/sre-book/embracing-risk/)

[17] [OpenTelemetry — Semantic Conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/)

[18] [NIST — SP 800-218, Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)

[19] [Planalto — Lei nº 13.709/2018, LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/L13709compilado.htm)

[20] [COFECI — Comunicação de Não Ocorrência e PLD](https://www.cofeci.gov.br/comunicacao-de-nao-ocorrencia)

[21] [Pagar.me — Recebedores](https://docs.pagar.me/reference/recebedores-1)

[22] [Pagar.me — Criando uma transferência, referência V4 descontinuada](https://docs.pagar.me/v4/reference/criando-uma-transfer%C3%AAncia)

[23] [Receita Federal — Declarar atividades imobiliárias (DIMOB)](https://www.gov.br/pt-br/servicos/declarar-atividades-imobiliarias)

[24] [Receita Federal — Entenda a Reforma Tributária do Consumo](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo/entenda)

[25] [Planalto — Lei Complementar nº 214/2025](https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm)

[26] [Microsoft — Transactional Outbox Pattern](https://learn.microsoft.com/en-us/azure/architecture/databases/guide/transactional-out-box-cosmos)

[27] [PostgreSQL — Using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)

[28] [PostgreSQL — Indexes](https://www.postgresql.org/docs/current/indexes.html)

[29] [OpenAPI Initiative — OpenAPI Specification](https://spec.openapis.org/oas/v3.0.3.html)
