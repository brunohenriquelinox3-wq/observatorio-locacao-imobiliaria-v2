# Gates e runbooks operacionais — Netlify + Supabase

## Versão 0.1 — agosto de 2026

Este artefato impede que a estratégia de plataforma pare em diagramas. Cada gate traduz uma decisão em prova verificável; cada runbook descreve a resposta inicial a uma falha sem inventar correção de saldo, contrato, acesso ou documento. Os objetivos de recuperação, custos, plano contratado e limites efetivos serão aprovados antes de produção, pois variam por plano, parceiro e volume real.

> **Regra de mudança:** uma tela pode ser aprovada visualmente; uma mudança de domínio só é liberada quando o dado, o acesso, a integração, a recuperação e o sinal operacional também foram aprovados.

## 1. Gates obrigatórios de entrega

| Gate | Pergunta de saída | Provas mínimas | Bloqueia |
| --- | --- | --- | --- |
| **G0 — Ambiente** | A mudança sabe em qual ambiente roda e aonde aponta? | Projeto Supabase, site Netlify, domínio, branch, segredo, provider e URL de callback corretos; preview usa dados sintéticos. | Preview com segredo/dado de produção; endpoint de sandbox que chama parceiro real. |
| **G1 — Schema e migration** | O dado evolui de modo compatível e reproduzível? | Migration versionada, `db reset`, teste, lint, revisão de lock/índice, compatibilidade do app e plano de correção. | Alteração manual remota, coluna/policy sem migration ou release com app incompatível. |
| **G2 — Acesso** | Cada ação é permitida e negada no escopo certo? | Grants, RLS, teste pgTAP de permitir/negar, teste de RPC/Function, AAL2 para alçada de risco e revisão de view/definer. | Chave privilegiada no browser, policy sem teste ou autorização exclusiva na UI. |
| **G3 — Evidência** | Documento e dado sensível têm ciclo de vida controlado? | Bucket privado, policy por operação, caminho opaco, metadado, hash, versão, URL temporal, teste de revogação e retenção definida. | Arquivo público, sobrescrita de versão, link estável ou metadado sem owner/finalidade. |
| **G4 — Integração** | O efeito externo é auditável e reprocessável? | Contrato versionado, inbox/outbox, idempotência, assinatura, timeout, retry, exceção, sandbox e reconciliação. | Callback que muda saldo direto, HTTP pelo browser ou reenvio que cria novo efeito. |
| **G5 — Operação** | Falha é detectada, explicada e tratável? | SLI/SLO aprovada, alerta, dashboard, correlation ID, owner, runbook e teste de incidente. | Dependência crítica sem alerta, log com PII ou erro sem rota de escalonamento. |
| **G6 — Recuperação** | A equipe sabe recuperar o produto sem destruir histórico? | Backup de banco, estratégia distinta de objetos, RPO/RTO aprovados, ensaio de restore e procedimento de compensação/replay. | Restore tratado como ajuste de contrato/parcela ou backup não ensaiado. |
| **G7 — Capacidade e custo** | O fluxo cabe no plano e sob a carga esperada? | Volume, concorrência, payload, conexão, fila, Storage, Realtime, Function e orçamento medidos em homologação. | Lote pesado em runtime curto ou componente escalado sem métrica de limite/custo. |

## 2. Checklists por mudança

### 2.1 Mudança de banco, RLS ou RPC

Uma mudança de schema começa por modelo, ownership e classificação de dado. A migration inclui tabela/índice/constraint, grant, RLS, função e teste correspondente. O pipeline reconstroi o banco em ambiente isolado, executa pgTAP e lint, mede a consulta mais sensível e registra eventual lock ou backfill. Views, `security definer`, roles e service key seguem revisão reforçada, porque podem ampliar o escopo além do pretendido. [1] [2]

| Caso de teste | Resultado aceito |
| --- | --- |
| Usuário de outra organização/SPE/carteira consulta ou altera o objeto. | Leitura vazia ou erro previsto; linha original intacta. |
| Usuário correto executa comando em duplicidade ou com versão defasada. | Uma transação efetiva ou recusa explícita; audit event e outbox coerentes. |
| Administrador sem MFA eleva acesso/exporta dado/altera beneficiário. | Operação bloqueada até AAL exigido e aprovação aplicável. |
| Migration roda em banco com dados representativos de homologação. | Sem lock acima do limite definido, sem quebra de leitura compatível e com plano de retorno. |

### 2.2 Mudança de Function, segredo ou endpoint

Cada segredo recebe owner, sistema de origem, finalidade, ambiente, escopo, data de rotação e rota que o consome. No Netlify, segredo deve ficar no escopo/contexto de Function, e em Supabase, segredo de serviço ou Function nunca pode ser usado pelo cliente. Funções são testadas contra entrada válida, assinatura inválida, duplicata, timeout, erro de parceiro e segredo ausente. [3] [4]

| Checagem | Critério de aceite |
| --- | --- |
| Preview | Não usa URL, key, bucket, remetente ou callback de produção. |
| Autorização | Modo de usuário, serviço e webhook externo são explícitos; webhook valida assinatura própria. |
| Runtime | Caminho respeita CPU, duração, payload e compatibilidade do pooler. |
| Diagnóstico | Log contém correlação e classificação, nunca documento, segredo, CPF/CNPJ, conta bancária ou payload integral. |

### 2.3 Mudança de arquivo e evidência

Upload grande segue Storage direto e retomável, com bucket privado e policy; a application cria intenção, o upload recebe credencial/URL temporal, e a confirmação abre validação de metadado, hash, versão e finalidade. [5] O binário não é tratado como prova suficiente: classificação documental, retenção, revisão e eventual legal hold são regras do domínio e demandam validação jurídica e de privacidade.

### 2.4 Mudança de integração financeira, fiscal ou contábil

Uma integração somente entra em produção após sandbox/homologação do parceiro, contrato de autenticação, eventos, idempotência, limites, estorno/disputa, extrato, suporte e SLA. A programação do CRM preserva intenção, tentativa e retorno; não decide validade fiscal, não liquida pagamento e não substitui o ERP, o banco, a instituição de pagamento, o contador, o fiscal ou o jurídico habilitados.

## 3. Runbooks iniciais

| Sinal | Ação imediata segura | Investigação e recuperação | O que não fazer |
| --- | --- | --- | --- |
| Migration falhou | Pausar promoção e manter aplicação na versão compatível. | Ver migration history, log, lock e schema; corrigir com migration compensatória ou rollback de app, conforme plano aprovado. | Editar produção manualmente para “fazer passar”. |
| Pico de `42501`/RLS | Bloquear release/policy suspeita e preservar correlation IDs. | Identificar grant, policy, claim, membership e AAL; reproduzir em teste permitir/negar. | Relaxar policy ou conceder service role para contornar o erro. |
| Callback inválido/duplicado | Persistir erro seguro e responder conforme contrato sem reaplicar efeito. | Comparar assinatura, timestamp, `event_id`, hash e correlação; reprocessar inbox somente após correção. | Alterar parcela/contrato manualmente a partir de payload bruto. |
| Fila envelhecida ou repetindo | Reduzir consumo se houver risco e abrir caso de integração. | Inspecionar lease, tentativa, dependência, rate limit e mensagem venenosa; reexecutar com chave original. | Duplicar mensagem sem deduplicação ou apagar histórico de falhas. |
| Arquivo inacessível/exposto | Revogar URL/token e conter acesso conforme procedimento de incidente. | Conferir policy, bucket, versão, log de acesso e classificação; emitir nova URL só após autorização. | Tornar bucket público para “resolver rápido”. |
| Falha de Function/limite | Proteger rota e voltar para caminho seguro ou job persistido. | Medir duração, CPU, payload, conexão e parceiro; mover trabalho para fila/worker se necessário. | Aumentar memória/timeout sem medição ou colocar lógica crítica na Edge. |
| Necessidade de restore | Acionar owner de dados, congelar mudança de risco e avaliar impacto. | Usar RPO/RTO aprovados, ensaiar no ambiente isolado quando possível, restaurar banco/objetos conforme plano e reconciliar. | Usar restore para reverter uma única cobrança ou decisão de contrato. |

## 4. Sinais, metas e orçamento de risco

Não são definidos números universais nesta fase. A primeira implantação aprovará baselines e metas por jornada, mas já deve medir os sinais abaixo desde a homologação. O objetivo não é somar dashboards: é reduzir o tempo entre desvio, entendimento e decisão segura.

| Jornada | Indicadores de base | Limite de decisão futura |
| --- | --- | --- |
| Acesso | logins, MFA, recusas RLS, sessão expirada, acesso negado por escopo. | Taxa de erro e tempo de recuperação acordados com operação. |
| Comercial | latência de lista/registro, conflito de reserva, atraso de proposta. | Meta por ação crítica e volume por organização. |
| Documento | upload incompleto, URL expirada, acesso negado, tamanho e verificação pendente. | Tempo máximo de ingestão/validação por classe documental. |
| Integração | backlog, idade de mensagem, tentativa, erro por parceiro, inbox duplicado, divergência. | Janela de retry, alerta e escalonamento por contrato do parceiro. |
| Banco | conexões, query lenta, lock, falha de migration, uso de Storage e custo. | Orçamento de conexão/compute e ponto de upgrade/particionamento. |
| Realtime | conexões, joins, mensagens, queda e fallback de leitura. | Teto por plano/projeto e regra de degradação. |

## 5. Simulações obrigatórias antes do primeiro piloto

| Simulação | Objetivo | Resultado que aprova |
| --- | --- | --- |
| Dupla reserva de lote/unidade | Provar concorrência controlada. | Só uma reserva válida; a outra recebe conflito explicável. |
| Callback de pagamento repetido e fora de ordem | Provar idempotência e reconciliação. | Sem duplicar settlement/distribuição; exceção abre caso. |
| Upload interrompido e retomado | Provar integridade de evidência. | Uma versão válida com hash e metadado; arquivo incompleto não é utilizável. |
| Revogação de acesso de contador/parceiro | Provar corte de permissão e documentação. | RLS/Storage bloqueiam novas leituras; audit event registra a mudança. |
| Migration sob volume sintético | Provar compatibilidade e lock aceitável. | Release segue sem perda de dado; plano de correção validado. |
| Queda de parceiro/429 | Provar queue, backoff, alerta e operação. | Tentativa não é perdida; operador tem reprocessamento seguro. |
| Restore ensaiado | Provar RPO/RTO e separação banco/objeto. | Equipe explica escopo recuperado, lacuna e reconciliação posterior. |

## Referências

[1] [Supabase Docs — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

[2] [Supabase Docs — Testing and linting](https://supabase.com/docs/guides/local-development/cli/testing-and-linting)

[3] [Netlify Docs — Environment variables overview](https://docs.netlify.com/build/environment-variables/overview/)

[4] [Supabase Docs — Securing Edge Functions](https://supabase.com/docs/guides/functions/auth)

[5] [Supabase Docs — Resumable Uploads](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)
