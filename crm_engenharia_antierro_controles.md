# Controles anti-erro — prevenção, detecção, contenção e recuperação

## 1. Modelo de defesa em cinco movimentos

> **Regra:** cada fluxo crítico precisa declarar como evita o erro, como descobre o desvio, como limita o impacto, como recupera sem falsificar a história e qual prova demonstra que a defesa funciona.

| Classe | Prevenir | Detectar | Conter | Recuperar | Prova mínima |
| --- | --- | --- | --- | --- | --- |
| Regra de domínio | Máquina de estados, invariante, schema e transação/RPC; valores e vigência explícitos. | Audit event de transição inválida, métrica de conflito e revisão de exceção. | Bloquear comando; preservar rascunho e explicar próximo passo. | Compensação/retificação versionada, nunca alteração silenciosa do fato. | Unitário + integração concorrente + caso de transição proibida. |
| Multiempresa e acesso | RLS/grant, menor privilégio, negar por padrão, escopo por organização/SPE/relação/finalidade. | Log de deny, amostra de policy, alerta de exportação/alçada incomum. | 403 seguro, revogação e step-up; limitar sessão/URL. | Corrigir policy, revisar exposição, notificar pelo processo aplicável. | Matriz permitir/negar em dados, arquivos, endpoints e exportações. |
| Comando econômico | Idempotency key, snapshot de regra, validação de base, teto, ordem e aprovação. | Diferença entre fato, outbox, inbox e retorno; saldo de exceção. | Estado pendente; impedir novo efeito e encaminhar à fila humana. | Replay idempotente, compensação aprovada e reconciliação. | Teste de duplicata, atraso, fora de ordem, parcial e arredondamento. |
| Integração externa | Contrato versionado, timeout, assinatura, allowlist e validação de payload. | Correlation ID, latência/erro por parceiro, backlog e contrato quebrado. | Circuit breaker/limite, fila de exceção, modo manual delimitado. | Retry com backoff, replay e reconciliação com parceiro. | Sandbox + teste de contrato + simulação de timeout/200 ambíguo. |
| Documento e evidência | Bucket privado, policy de objeto, checksum/metadado, upload validado e versão. | Evento de acesso, upload incompleto, hash divergente e policy deny. | Quarentena, revogar URL/acesso e bloquear uso do artefato incompleto. | Novo upload/versão; restauração de objeto validada e registrada. | Upload interrompido, permissionamento, download e auditoria testados. |
| Interface e comando | Estados explícitos, validação no servidor, desabilitar duplo envio, UX de confirmação proporcional. | Error boundary, erro de comando, abandono, retry e correlação de frontend. | Fallback de painel/rota e texto seguro; não mostrar sucesso não confirmado. | Recarregar estado canônico; retomar rascunho; retry somente quando seguro. | E2E isolado: loading, erro, parcial, reconexão, mobile e teclado. |
| Release e dependência | PR revisado, tipagem/lint, migration expandir-contrair, lockfile, scan e dependência aprovada. | SLO por release, alerta de regressão, inventário e drift de schema. | Canário/flag, parar rollout, bloquear merge e congelar mudança. | Rollback do app, migration compensatória e reconciliação de dado. | Preview, check obrigatório, scan, review de dependência e rollback ensaiado. |
| Capacidade e degradação | Orçamento de pool/fila/payload, paginação, backpressure e teste de carga. | SLI de latência, erro, fila, idade, conexão e custo. | Rate limit, fila durável, fallback de leitura e pausa de automação não crítica. | Drenar/reprocessar e escalar de modo medido; revisar desenho. | Carga por jornada e falha parcial com RTO/RPO/SLO declarados. |
| IA assistida | Fonte/escopo autorizado, avaliação, policy, human-in-the-loop e kill switch. | Feedback, divergência, cobertura de fonte e taxa de recusa/override. | Ocultar recomendação, exigir revisão e bloquear ação irreversível. | Voltar a fluxo manual; corrigir fonte/prompt/regra e reavaliar. | Conjunto de avaliação, casos adversariais e trilha de aprovação. |

## 2. Regras de código e dados que bloqueiam descuido comum

| Regra | Erro que evita | Aplicação esperada |
| --- | --- | --- |
| Validar toda fronteira externa. | Payload de formulário, webhook, CSV, URL, claim ou API é assumido como confiável. | Schema versionado; mensagem de validação segura; rejeição e log sem dado sensível. |
| Fazer estados perigosos impossíveis de representar. | `undefined`, lista vazia ou fallback significa “todos”, “aprovado” ou “sem filtro”. | Tipos discriminados, enums, limites explícitos e teste para vazio/nulo/valor ausente. |
| Modelar tempo e valor de forma explícita. | Fuso, competência, data de corte, moeda, índice ou precisão são inferidos do cliente. | Instante, timezone de negócio, unidade monetária, regra e arredondamento ficam no fato/versionamento. |
| Deixar o servidor decidir efeito e autorização. | Interface esconde botão, mas endpoint/RPC aceita comando; regra é duplicada em cliente. | RLS/RPC/policy/transação são fonte de decisão; cliente apresenta, não autoriza. |
| Tornar repetição segura ou explicitamente bloqueada. | Clique duplo, timeout, retry ou evento repetido produz efeito adicional. | Chave idempotente, versão do agregado, inbox/outbox e resposta de estado já processado. |
| Preferir mudança pequena, observável e reversível. | Deploy mistura schema, regra, UI e integração sem saber a causa de regressão. | Flag, rollout, migration compatível, correlação de release e rollback testado. |
| Não transformar exceção em padrão silencioso. | `catch` vazio, fallback genérico, `any`, erro “resolvido” por retry infinito. | Error code, owner, limite de retry, fila de exceção e teste/alerta. |

## 3. Contrato de erro e de decisão

O cliente recebe uma mensagem acionável e um identificador de correlação; operadores autorizados podem ligar esse identificador a telemetria, audit event e trace. O contrato não transporta stack trace, segredo, query, token, dado de outro cliente ou texto técnico que aumente exposição.

| Campo público | Campo operacional protegido | Exemplo de uso |
| --- | --- | --- |
| `code`, `message`, `action`, `correlation_id`, `retryable` | release, trace, causa normalizada, policy, partner reference, evento técnico, amostra minimizada. | “Não foi possível confirmar a reserva. Aguarde a verificação ou consulte o código X.” |
| `state` e `next_check_at` | idade de fila, tentativa, lease, idempotency key e resultado do parceiro. | “Recebimento em reconciliação; não reenviar manualmente.” |
| `field_errors` sem ecoar dados sensíveis | schema/versionamento, validação original sanitizada e origem. | “Documento obrigatório ausente.” |

## 4. Matriz de testes de engenharia

| Camada | Pergunta respondida | Exemplos prioritários |
| --- | --- | --- |
| Tipagem, lint e análise estática | A mudança viola contrato local, padrão inseguro ou qualidade conhecida? | TypeScript estrito, promise aguardada, secret scan, análise estática e regra de import. |
| Unitário de domínio | A regra pura e a invariante se mantêm? | Transições de reserva, cálculo versionado, split, indexação, vigência e arredondamento. |
| Integração de dados/policy | A transação e o RLS aplicam a decisão correta? | Permitir/negar por org/SPE, concorrência, migration, exportação e Storage. |
| Contrato de parceiro | Mensagem e endpoint continuam compatíveis? | Webhook assinado, schema, timeout, retorno duplicado e rejeição. |
| E2E de jornada | A pessoa conclui a tarefa com estado claro? | Cadastro, reserva, proposta, documento, fila e retorno do erro. |
| Carga e falha parcial | A jornada degrada de maneira controlada? | Pool, backlog, upload, callback, indisponibilidade e recuperação. |
| Segurança e revisão humana | O controle resiste ao uso indevido e à alteração? | Autorização, segredo, dependência, feature flag, IA e revisão de release. |

## 5. Gatilhos para interromper promoção

Uma promoção é bloqueada se houver vulnerabilidade/segredo sem decisão registrada, RLS sem caso negar, migration sem reversão/compensação, endpoint financeiro sem idempotência e sandbox, documento privado sem policy testada, erro sem correlação, SLO sem sinal, backlog de fila acima do limite ou automação de alto impacto sem kill switch. A exceção só é aceita com risco residual, data de vencimento, owner e aprovação proporcional.

## Referências de base

[1] [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/) e [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)

[2] [Playwright — Best Practices](https://playwright.dev/docs/best-practices)

[3] [GitHub Docs — Code Scanning](https://docs.github.com/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning) e [Dependency Review](https://docs.github.com/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review)

[4] [Google SRE — Postmortem Culture](https://sre.google/workbook/postmortem-culture/)
