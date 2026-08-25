# Matriz aprofundada de engenharia anti-erro — jornadas críticas do CRM

## Versão 0.2 — agosto de 2026

> **Tese operacional:** um bug relevante não é apenas uma exceção. Ele é uma quebra de invariante, de isolamento, de versão, de intenção, de efeito externo ou de entendimento do operador. A resposta madura preserva o fato, mostra o estado verdadeiro e impede que o usuário “conserte” o sistema repetindo um comando perigoso.

## 1. Método de priorização

O aprofundamento usa quatro perguntas antes de discutir uma solução: **qual estado não pode existir**, **qual efeito é externo ou irreversível**, **como a falha será percebida por usuário e operação**, e **qual prova evita reincidência**. A prioridade não depende do volume de tickets; depende da combinação entre raio de impacto, reversibilidade, detectabilidade e exposição de dados.

| Faixa | Critério | Exemplo no CRM | Regra de promoção |
| --- | --- | --- | --- |
| P0 — bloqueante | Pode produzir acesso indevido, dupla venda, fato econômico duplicado, perda de evidência ou dano que exige reparação humana. | Policy de outra SPE, reserva concorrente, callback duplicado, split reaplicado. | Não entra em piloto sem prevenção no servidor, teste negativo, correlação, contenção e recuperação ensaiada. |
| P1 — alto | Interrompe rotina material ou pode degradar decisão, mas possui compensação delimitada. | Upload incompleto, exportação com corte errado, credencial expirada durante trabalho. | Exige fallback explícito, alarme acionável e teste de jornada. |
| P2 — controlado | Afeta produtividade ou compreensão sem alterar verdade de domínio. | Filtro salvo inválido, visualização lenta, erro de rótulo. | Exige ticket reprodutível, owner, correção e regressão proporcional. |

## 2. Padrões de código que passam a ser obrigatórios

O cliente pode orientar, mas **não autoriza**. Todo comando crítico é decidido por transação/RPC ou função server-side, com escopo revalidado, estado esperado e resultado explícito. O uso de RLS não dispensa grants mínimos nem testes positivos e negativos por operação; para tabelas expostas, o próprio Supabase orienta habilitar RLS, ajustar grants, escrever policy por operação e executar testes de banco. [1]

| Padrão | Antipadrão bloqueado | Implementação mínima | Sinal e teste |
| --- | --- | --- | --- |
| **Estado discriminado** | `null`, lista vazia ou `catch` genérico significar “aprovado”, “todos” ou “pode seguir”. | `draft`, `pending`, `confirmed`, `reconciling`, `exception`, `compensated`; transição só por comando server-side. | Unitário de toda transição proibida e E2E com estado parcial visível. |
| **Versão esperada** | Aba antiga sobrescreve preço, condição, reserva ou regra de direito. | `expected_version`, unique constraint ou lock adequado no agregado; retorno de conflito, não falso sucesso. | Integração com duas sessões concorrentes; métrica de conflito por jornada. |
| **Transação curta e pura** | Query complexa + rede + parceiro dentro da transação; retry global repete efeito externo. | Persistir decisão e outbox juntos; chamada externa acontece depois, por trabalhador idempotente. | Falha `40001`/timeout simulada; prova de que nenhuma instrução externa foi duplicada. |
| **Intenção separada de efeito** | “HTTP 200” do parceiro ser tratado como liquidação/repasse confirmado. | `instruction_intent`, `outbox`, `partner_attempt`, `inbox_event`, `reconciliation_case`; referências externas e digest de parâmetros. | Contrato de callback repetido, atrasado, parcial e fora de ordem. |
| **Erro seguro e acionável** | Stack trace, SQL, token, documento ou payload retornar ao navegador; mensagem “erro desconhecido”. | `code`, `state`, `action`, `retryable`, `correlation_id`, `next_check_at`; detalhes protegidos em telemetria. | Snapshot do payload público e teste de ausência de segredo/PII. |
| **Observabilidade com minimização** | Log virar cópia de CPF/CNPJ, token, arquivo, resposta bancária ou justificativa jurídica. | Allowlist de atributos; mascaramento; trace e audit event referenciados por correlação, mas armazenados em trilhas distintas. | Teste de sanitização e revisão de amostragem/retenção. |
| **Mudança expandir–migrar–contrair** | App novo depender de coluna/policy inexistente ou migration destruir leitura antiga. | Adicionar compatibilidade, migrar dados, promover leitura nova, retirar legado somente após métrica e reversão. | Preview, migration em ambiente isolado, canário e plano de compensação. |

O PostgreSQL lembra que `Read Committed` não impede todas as anomalias em comandos complexos e que transações mais estritas podem falhar com necessidade de retry integral. [2] No CRM, essa repetição é permitida apenas para trecho **puro e interno**: leitura, validação e gravação transacional. Nunca se repete automaticamente uma chamada de pagamento, assinatura, e-mail, mensageria ou download de documento por causa de um retry de banco.

## 3. Matriz de falha por jornada

| Jornada e invariante | Falha/bug que precisa ser reproduzido | Prevenção no código e no dado | Detecção e contenção | Recuperação e prova de regressão |
| --- | --- | --- | --- | --- |
| **Acesso, convite e administração** — pessoa fora do escopo não lê nem comanda. | Claim/JWT defasado após revogação; grant excessivo; view/função ignora policy; `service_role` chega ao browser. | Grants mínimos, RLS por operação, função de comando com escopo/expiração/MFA; `service_role` apenas em runtime confiável; teste por organização, SPE e finalidade. | `authorization_denied` com correlação, alerta de exportação/step-up incomum, pausa de conta e revogação de sessão. | Revalidar grant, revogar, analisar exposição pelo processo aplicável; pgTAP prova permitir/negar e que o alvo negado ficou intacto. |
| **Cadastro e deduplicação** — uma parte não se fragmenta sem decisão auditável. | Dois fluxos criam CPF/CNPJ/empresa equivalentes; normalização diverge; merge perde relação, evidência ou direito. | Normalização versionada, unique constraint onde aplicável, revisão de possível-match e comando de merge com mapa de relações. | Colisão, métrica de duplicata por origem e estado “em revisão”; bloqueio de criação quando a confiança exigir. | Merge compensável, preservando identificadores, eventos e autor; teste de importação concorrente e reversão auditada. |
| **Reserva, estoque e lote** — uma unidade não alcança estado comercial incompatível. | Dois corretores confirmam a mesma reserva em abas distintas; hold expirado reaparece indevidamente; tabela mudou durante proposta. | Máquina de estados, versão esperada, unicidade/lock adequado, relógio de negócio, tabela/condição snapshot. | `reservation_conflict`, métrica de colisão, UI recarrega estado canônico e não confirma sucesso local. | Cancelamento/retificação por novo fato; teste concorrente com duas transações e E2E de reconexão. |
| **Proposta, contrato e poderes** — aprovação refere-se à versão correta. | Aceite contra preço/índice/documento/poder revogado; assinatura é enviada após mudança de parte. | Snapshot imutável de proposta, evidência de poder vigente, alçada e precondições no servidor; id de versão no pedido de assinatura. | Comparação de versão imediatamente antes da instrução; estado `stale`/`blocked`; audit event da divergência. | Nova versão ou retificação, nunca sobrescrita; teste de revogação durante a jornada e de conflito de versão. |
| **Recebível, split e fechamento** — cada efeito econômico nasce uma vez, tem regra e conciliação. | Timeout após parceiro aceitar; callback duplicado/fora de ordem; pagamento parcial; arredondamento excede base; recebedor bloqueado. | Subledger por evento, regra versionada, `intent_id` estável, digest de instrução, outbox/inbox, limites de soma/prioridade/vigência e aprovação. | Pendência por idade, diferença entre entitlement/instrução/retorno, bloqueio do lote, fila humana e alerta só quando acionável. | Replay idempotente, compensação aprovada e reconciliação por item; testes de duplicata, parcial, atraso, estorno, distrato e 100 recebedores. |
| **Documento privado e evidência** — objeto tem versão, cadeia e acesso compatível. | Upload termina parcialmente; objeto é trocado; URL expira; arquivo malicioso; metadado aponta para bucket/tenant errado. | Bucket privado, upload por estado, hash/metadado, policy de objeto, quarentena e verificação proporcional ao risco; URL temporária apenas após autorização. | Evento de upload/download, hash divergente, deny de policy, alerta de acesso administrativo e estado claro ao usuário. | Nova versão ou restauração validada; teste de upload interrompido, troca de escopo, link expirado e arquivo recusado. |
| **Webhook, fila e integração** — mensagem externa não cria efeito duas vezes. | Parceiro retorna 200 e conclui depois; evento se repete; assinatura falha; ordem chega invertida; limite de API é atingido. | Verificar assinatura/schema, inbox com id externo+tipo+hash, outbox durável, lease, backoff com teto, circuit breaker e estado de reconciliação. | Backlog, idade, falha de assinatura, taxa de reprocesso, distinção entre sintomas do usuário e causa técnica. | Reprocessar apenas evento seguro, pedir referência ao parceiro e compensar por caso; contract test e simulação de 200 ambíguo/timeout. |
| **Relatório, exportação e contador** — recorte não mistura organização, competência ou versão. | Filtro ignora SPE, timezone ou policy; agregação usa dado não conciliado; CSV reabre sem evidência de corte. | Query no banco com escopo, catálogo de métrica, `as_of`, timezone de negócio, versão de regra e exportação registrada. | Reconciliação com subledger, divergência de total, alerta de acesso/exportação e “dados em atualização” explícito. | Invalidar/reemitir com versão e causa; teste de escopo cruzado, corte temporal e arquivo de exportação auditado. |
| **Release, migration e dependência** — mudança pode ser identificada e revertida sem apagar fatos. | Client novo conversa com schema antigo; RLS bloqueia tudo; flag órfã; pacote vulnerável/transitivo; segredo de ambiente errado. | PR pequeno, lockfile, revisão de dependência, análise estática, migration compatível, preview sem dado real, flag com owner/expiração. | SLO por release, erro por versão, drift de schema, secret scan, dependency review e registro de rollout. | Rollback do app, migration compensatória e reconciliação distinta; teste de promoção/rollback e inventário de flags. |
| **Interface, mobile e operação assistida** — a tela não induz ação repetida ou conclusão falsa. | Duplo clique, cache obsoleto, loading infinito, permissão muda, polling falha, foco some, erro parcial parece sucesso. | Controle de submissão, `request_id`, cache invalidado por versão, boundary por rota/painel, estados textuais, rascunho local seguro e acessibilidade. | Telemetria de abandono/erro por ação, trace de UI, erro com correlação, observação sintética de jornada crítica. | Recarregar estado canônico, manter rascunho quando seguro e oferecer retry apenas para leitura ou comando idempotente; E2E isolado desktop/mobile/teclado. |

## 4. Regras de retry, retry proibido e estado desconhecido

| Situação | Pode repetir automaticamente? | Estado que a pessoa vê | Decisão da operação |
| --- | --- | --- | --- |
| Leitura idempotente que falha antes de obter resposta. | Sim, com limite/backoff e cancelamento. | “Não foi possível atualizar; tentando novamente” ou ação manual. | Medir taxa/latência; abrir incidente se afetar SLO. |
| Transação de banco que falha por serialização antes de commit. | Sim, reexecutando a decisão transacional inteira, se pura e limitada. | “Atualizando para a versão atual” ou conflito, conforme regra. | Registrar conflito; não reusar resultado parcial. |
| POST a parceiro após timeout ou queda de rede. | Não por tentativa cega. | “Em reconciliação; não reenviar”. | Consultar por referência/idempotência, aguardar callback ou abrir caso. |
| Callback duplicado ou fora de ordem. | O processamento pode ser reaplicado somente se a inbox provar que não produziu efeito. | “Atualização recebida; conferindo estado”. | Deduplicar, ordenar/validar versão e registrar exceção se ambíguo. |
| Ação financeira, assinatura, revogação ou exportação com estado incerto. | Não. | “Ação pendente de confirmação”. | Bloquear novo efeito, preservar intenção e encaminhar pela alçada adequada. |

APIs podem oferecer idempotência própria, mas a retenção e a semântica variam. A documentação da Stripe, por exemplo, devolve o primeiro resultado para a mesma chave, inclusive 500, e alerta que chaves removidas após o período de retenção podem gerar nova requisição. [3] Portanto, a chave do parceiro é uma camada, não a fonte de verdade do CRM.

## 5. Kit de depuração reproduzível e seguro

Um defeito só pode ser marcado como “resolvido” depois de possuir reprodução segura. Comunidades e issue trackers ajudam a encontrar sintomas recorrentes; o exemplo mínimo e reprodutível é hipótese de diagnóstico, não permissão para copiar uma solução de produção. O pacote abaixo não usa dado real de cliente, documento, token, CPF/CNPJ ou referência bancária.

| Campo do pacote | Conteúdo obrigatório |
| --- | --- |
| Identidade | `bug_id`, jornada, invariante, severidade, release, ambiente, owner e data de captura. |
| Cenário | Pré-condições sintéticas, ator/escopo, passo a passo, resultado esperado, resultado observado e raio de impacto. |
| Correlação | `correlation_id`, `trace_id`, release, versão de schema/policy, referência de outbox/inbox sanitizada e horário com timezone. |
| Evidência | Log sanitizado, trace, screenshot sem PII, fixture, resposta de contrato e dados de teste controlados. |
| Hipótese e decisão | Fonte usada, versão, alternativa descartada, risco de regressão, correção escolhida e motivo. |
| Prova de saída | Teste que falhava antes e passa depois, teste negativo, alerta/monitoramento ajustado, rollback/compensação quando aplicável. |

## 6. Radar de sites para erro e solução — uso controlado

| Tipo de fonte | Exemplos de uso | Como entra no CRM | O que não pode acontecer |
| --- | --- | --- | --- |
| **Primária** | Documentação PostgreSQL/Supabase/Netlify, RFC, OWASP, NIST, CISA, changelog e advisory/CVE. | Define comportamento, versão, limite e requisito de teste. | Citar snippet de buscador ou página secundária quando a fonte primária existe. |
| **Manutenção e diagnóstico** | GitHub Issues/Discussions do fornecedor, release notes, dashboards de status, rastreadores de observabilidade. | Formula reprodução, detecta regressão de versão e acompanha correção upstream. | Assumir que issue fechada prova compatibilidade com a arquitetura ou o domínio do CRM. |
| **Comunidade técnica** | Stack Overflow, fóruns Supabase/Netlify, posts de engenheiros. | Produz hipótese, exemplo mínimo e caminhos alternativos. | Copiar código sem entender escopo, versão, segurança, licença e teste. |
| **Operação interna** | Incidente, postmortem, métricas, traces, testes e feedback de piloto. | É a evidência mais direta do comportamento do produto, com acesso controlado. | Expor cliente, segredo, documento ou dado financeiro em ticket, trace ou fórum. |

## 7. Portas de qualidade para cada mudança

1. **Especificar:** invariante, estado, escopo, efeito e decisão humana necessária.
2. **Construir:** tipo/schema, transação, policy, idempotência, tratamento de erro e telemetria mínima.
3. **Provar:** lint/tipo, unitário, integração, RLS, contrato, E2E e carga conforme o risco.
4. **Promover:** preview, migration compatível, rollout controlado, owner, rollback/compensação e alerta acionável.
5. **Aprender:** incidente ou bug vira repro, teste, runbook, controle, owner e data de revalidação.

O monitoramento deve combinar sintomas externos e contexto interno; a literatura de SRE alerta que alertas humanos precisam ser simples, urgentes e acionáveis, não uma coleção de anomalias vagas. [4] Já a instrumentação baseada em traces, métricas e logs deve permitir explicar o comportamento novo sem adicionar captura improvisada durante o incidente. [5]

## Referências

[1] [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

[2] [PostgreSQL — Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)

[3] [Stripe — Idempotent Requests](https://docs.stripe.com/api/idempotent_requests)

[4] [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)

[5] [OpenTelemetry — Observability Primer](https://opentelemetry.io/docs/concepts/observability-primer/)

[6] [OWASP — Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)

[7] [OWASP — Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)

[8] [Playwright — Best Practices](https://playwright.dev/docs/best-practices)

[9] [GitHub — Dependency Review](https://docs.github.com/en/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review)

[10] [NIST — SP 800-218 Secure Software Development Framework](https://csrc.nist.gov/pubs/sp/800/218/final)

[11] [CISA — Secure by Design](https://www.cisa.gov/securebydesign)
