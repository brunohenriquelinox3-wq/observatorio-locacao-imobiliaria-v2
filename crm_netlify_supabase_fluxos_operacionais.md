# Fluxos operacionais — Netlify, Supabase e parceiros

## Versão 0.1 — agosto de 2026

Este documento fixa a linha operacional entre **entrega**, **dado**, **comando**, **evento** e **parceiro externo**. O propósito é impedir o erro recorrente de transformar uma Function, um webhook ou uma tela em fonte de verdade. O CRM preserva o fato de domínio no Postgres, valida acesso no banco e delega cobrança, liquidação, KYC, assinatura, ERP e escrituração a parceiros e profissionais habilitados.

> **Princípio de roteamento:** Netlify entrega a experiência; Supabase decide e conserva o estado; uma fila transporta trabalho; um parceiro responde por seu efeito externo; a reconciliação confirma a realidade operacional.

## 1. Regra de escolha do runtime

| Situação | Caminho principal | Razão arquitetural | Nunca usar como substituto |
| --- | --- | --- | --- |
| Leitura de carteira, imóvel, proposta ou evidência autorizada | App Netlify → Data API/consulta Supabase sob sessão e RLS | Mantém o filtro junto da fonte de verdade e evita um BFF artificial para leituras comuns. | Filtro exclusivo no React ou URL direta de Storage. |
| Comando transacional de CRM | App → RPC/Function Supabase autenticada → Postgres | Reserva, direito, aprovação, distribuição ou fechamento precisam de estado, alçada, versão e audit event na mesma unidade de decisão. | Sequência de `insert/update` independentes no browser. |
| Endpoint web ligado à experiência/site | Netlify Function/Edge, se houver justificativa de borda ou segredo específico do site | Functions são versionadas com o deploy; Edge é apropriada a rota, proteção e personalização muito leve. [1] [2] | Ledger, cálculo de split, upload de documento ou regra econômica crítica. |
| Callback de parceiro próximo do dado | Supabase Edge Function → inbox → processador/RPC | A validação de assinatura e a persistência do inbox ficam próximas ao Postgres; função de usuário conserva RLS e função de serviço é limitada por segredo. [3] | Aplicar pagamento, contrato ou saldo diretamente no handler. |
| Saída para fornecedor | RPC grava outbox + audit event → Queue/worker → parceiro | O fato e a intenção saem na mesma transação; a entrega se torna idempotente, observável e reprocessável. [4] | Chamada HTTP do browser ou efeito externo antes de gravar intenção. |
| Trabalho lento/repetível | Queue do Supabase + worker delimitado | Fila durável oferece visibilidade, arquivamento e controle de consumo; runtime apenas executa uma tentativa. [5] | `waitUntil`, cron ou Function em memória como mecanismo de garantia. |
| Checagem periódica | Cron Netlify ou Supabase abre um job único | Agendas têm limites e devem iniciar trabalho curto, não encerrar fluxo econômico. [6] [7] | Conciliação pesada ou cálculo final sem fila, lock e revisão. |
| Documento grande/sensível | Upload direto e retomável ao Storage privado → confirmação/validação | Upload retomável evita limites de Function e a policy do Storage continua aplicável. [8] | Passar binário de dossiê por Function, e-mail ou bucket público. |

## 2. O envelope mínimo de uma integração

Todo evento de inbox, mensagem de outbox e execução de job usa o mesmo vocabulário, mesmo que o transporte mude. Isso permite reprocessar, explicar e comparar os fluxos de cobrança, assinatura, ERP, e-mail, portal e KYC sem misturar o payload de cada fornecedor à regra de negócio.

| Campo | Finalidade | Regra |
| --- | --- | --- |
| `message_id` | Identifica a mensagem do CRM. | UUID/ULID imutável. |
| `message_type` e `schema_version` | Declaram semântica e versão. | Consumidor rejeita ou estaciona versão desconhecida. |
| `organization_id`, `legal_entity_id`, `spe_id` | Mantêm fronteira multiempresa. | São validados contra o recurso relacionado, não confiados cegamente no payload. |
| `correlation_id` e `causation_id` | Ligam jornada, comando e evento. | Atravessam app, Function, Queue, parceiro e audit event. |
| `idempotency_key` | Evita reaplicação do efeito pretendido. | Única por intenção/fornecedor/operação conforme contrato. |
| `provider`, `external_event_id`, `external_reference` | Correlacionam a realidade do parceiro. | Unicidade impede callback duplicado. |
| `occurred_at`, `received_at`, `available_at` | Distinguem data externa, recebimento e agendamento. | Nunca substituir competência/efetivação por horário de tela. |
| `attempt`, `lease_until`, `failure_class` | Permitem retry seguro. | Tentativa não apaga causa nem resultado anterior. |
| `payload_ref` e `payload_hash` | Protegem conteúdo e prova de integridade. | Payload sensível minimizado, protegido e sujeito a retenção. |

## 3. Quatro sequências que não podem divergir

### 3.1 Comando econômico de saída

Um usuário autorizado aprova uma instrução, mas não confirma dinheiro, distribuição ou contabilização pela tela. A RPC valida escopo, estado, alçada, MFA quando aplicável, versão esperada e elegibilidade. Na mesma transação, grava o fato, a decisão, o audit event e uma `outbox_message`. O worker obtém lease, chama o parceiro com chave idempotente, grava tentativa e espera o retorno/consulta de reconciliação. Qualquer divergência abre caso operacional, sem alterar saldo por ajuste manual.

> **Regra financeira:** instruir, receber callback e conciliar são etapas distintas. O modelo deve ser validado com parceiro de pagamento, contador, fiscal e jurídico no contexto concreto.

### 3.2 Callback de parceiro

O receptor preserva o corpo bruto para validação de assinatura, verifica segredo, timestamp, origem e replay quando o contrato permitir, e registra um `inbox_event` com `provider + external_event_id` únicos. Só depois o processador transacional normaliza o evento, correlaciona contrato/parcela/beneficiário e decide se cria um evento econômico, uma compensação ou uma exceção. Endpoints sem JWT só são aceitáveis para webhooks cuja assinatura própria seja validada no handler. [3]

### 3.3 Documento privado

O app solicita uma intenção de upload autorizada; o documento sobe diretamente ao Storage privado por token/credencial compatível com policy; um job confirma tamanho, tipo, hash, versão, vínculo e estado de revisão. Upload TUS é retomável e a sobrescrita em path deve ser evitada para não comprometer histórico e cache. [8] A evidência só se torna utilizável após os controles de domínio; um arquivo presente não prova aprovação, validade ou conformidade.

### 3.4 Agenda, fila e worker

Cron examina a condição de elegibilidade e tenta criar um job com chave natural única. A Queue transporta a tarefa e o worker registra lease, tentativa, resultado, erro classificado e próxima ação. Database webhook pode notificar um processador após uma alteração, mas como ocorre após a linha mudar e é assíncrono, ele não substitui a outbox transacional. [4] [5] Tarefas de fundo de Edge Function podem melhorar a resposta percebida, mas permanecem sujeitas a limites de runtime e não são fonte durável. [9]

## 4. Antipadrões bloqueados por arquitetura

| Antipadrão | Risco | Controle que bloqueia |
| --- | --- | --- |
| Service role em frontend, preview ou log | Bypass integral de RLS. | Segredo apenas em runtime, escopo mínimo, owner e auditoria de uso. |
| Callback que altera parcela/entitlement no handler | Repetição, fraude, efeito fora de estado e perda de reconciliação. | Inbox único, processador/RPC, idempotência e caso de exceção. |
| Webhook de banco como garantia de entrega | Evento ocorre após a mudança e não representa confirmação do terceiro. | Outbox na transação, fila, tentativa e reconciliação. |
| Realtime como confirmação financeira | Queda, limite, payload truncado ou atualização fora de ordem. | Estado Postgres + consulta de recuperação e versão otimista. [10] |
| Upload de dossiê por Function | Timeout, limite de payload e exposição indevida. | Storage privado, TUS, política e metadado de evidência. [8] |
| Migration/Policy manual em produção | Histórico divergente e rollback opaco. | Arquivo versionado, branch/preview, teste pgTAP, lint e gate. [11] |
| Scheduled Function como job pesado | Tempo limitado e ausência de execução automática em preview. | Agenda só cria job; fila/worker conserva estado. [6] |

## 5. Matriz de testes antes de homologação

| Fluxo | Prova mínima | Falha que deve ser simulada | Evidência de aprovação |
| --- | --- | --- | --- |
| RLS multiempresa | Permitir membro correto; negar membro externo, papel inferior e SPE errada. | JWT expirado, grant indevido, view exposta e AAL insuficiente. | Teste pgTAP, resultado do pipeline e revisão de policy. |
| RPC crítica | Uma mudança íntegra com audit event/outbox. | Duplo clique, concorrência, estado ultrapassado e tentativa sem alçada. | Teste transacional e registro de versão/compensação. |
| Callback | Mesmo callback aceito uma vez e duplicata neutra. | Assinatura inválida, replay, referência ausente e payload incompatível. | Inbox, hash, tentativa e exceção rastreáveis. |
| Outbox/Queue | Mensagem entregue ou estacionada explicavelmente. | Timeout, 429/5xx, worker interrompido, mensagem venenosa e reenvio. | `job_run`, lease, tentativa, alerta e replay documentado. |
| Documento | Upload/visualização autorizados; externo negado. | Queda de rede, path repetido, token expirado e revogação. | Metadado, hash, policy e audit event. |
| Deploy/migration | Preview isolado atualiza schema compatível. | Migration falha, policy regressiva, segredo de ambiente errado e rollback. | Checklist de release, migration history e sinal de saúde. |

## 6. Limite de responsabilidade e decisão futura

Esta matriz não promete que Netlify ou Supabase cubram toda necessidade de um CRM maduro. Processamento acima dos limites de função, OCR/lote pesado, analytics analítico, alta disponibilidade ampliada, residência, SSO corporativo, backup de objetos, antifraude e parceiros regulados exigirão decisão de arquitetura, custo, contrato e teste próprios. O objetivo da base é tornar essas extensões explícitas antes de se tornarem dívida escondida.

## Referências

[1] [Netlify Docs — Functions overview](https://docs.netlify.com/build/functions/overview/)

[2] [Netlify Docs — Edge Functions limits](https://docs.netlify.com/build/edge-functions/limits/)

[3] [Supabase Docs — Securing Edge Functions](https://supabase.com/docs/guides/functions/auth)

[4] [Supabase Docs — Database Webhooks](https://supabase.com/docs/guides/database/webhooks)

[5] [Supabase Docs — Queues](https://supabase.com/docs/guides/queues)

[6] [Netlify Docs — Scheduled Functions](https://docs.netlify.com/build/functions/scheduled-functions/)

[7] [Supabase Docs — pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron)

[8] [Supabase Docs — Resumable Uploads](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)

[9] [Supabase Docs — Background Tasks](https://supabase.com/docs/guides/functions/background-tasks)

[10] [Supabase Docs — Realtime Limits](https://supabase.com/docs/guides/realtime/limits)

[11] [Supabase Docs — Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)
