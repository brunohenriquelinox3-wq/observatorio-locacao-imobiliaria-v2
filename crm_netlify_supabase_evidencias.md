# Caderno de evidências — Netlify + Supabase

## Captura 01 — Netlify: entrega, ambientes e funções

| Fonte oficial | Achado verificável | Decisão para o CRM | Limite ou cuidado |
| --- | --- | --- | --- |
| Netlify, *Deploy Previews* | Pull/merge requests em repositório conectado podem gerar preview isolado; cada preview pode usar variáveis específicas por contexto e pode ser protegido por senha. [1] | Cada mudança de política RLS, migração, workflow financeiro, layout de contrato ou integração terá preview e roteiro de teste antes de produção. | Preview não recebe dados reais de produção; ambiente de homologação terá projeto Supabase separado e dados sintéticos/anonimizados. |
| Netlify, *Environment variables and serverless functions* | Variáveis em Functions podem ter valores por contexto de deploy; para runtime precisam de escopo de Functions; valores são fixados no deploy que os usa. [2] | Chaves privilegiadas só ficam em funções de servidor e são segregadas por desenvolvimento/homologação/produção. | Não colocar segredo em variável `VITE_*`, `netlify.toml` ou bundle; mudança de segredo exige novo deploy. |
| Netlify, *Background Functions* | Funções assíncronas podem executar até 15 minutos e retornam `202` de imediato; há tentativas automáticas após falhas. [3] | Importação não crítica, preparação de lote, geração de relatório e tarefas lentas podem ser despachadas, com execução registrada no Supabase. | Não substituem fila durável por si só; função precisa ser idempotente, ter estado persistido e não depender de resposta ao navegador. |
| Netlify, *Scheduled Functions* | Agendamentos usam cron UTC; possuem limite de 30 segundos; só disparam na agenda em deploys publicados, e podem ser executados manualmente no console para teste. [4] | Usar para verificação curta e periódica: vencimentos, alertas de recertificação, coleta leve de indicadores e disparo de trabalho posterior. | Não usar para fechamento pesado, conciliação em massa ou polling crítico; esses fluxos exigem desenho próprio de fila/worker e observabilidade. |

## Decisões provisórias de Netlify

1. **Netlify será o perímetro de entrega.** O repositório, previews, domínio, CDN e Functions compõem a camada web; não são a fonte de verdade de registros de negócio.
2. **Ambiente é uma fronteira de risco.** Desenvolvimento, homologação e produção terão variáveis e projetos Supabase distintos; produção não pode apontar para bucket, Auth ou banco de testes.
3. **Toda saída crítica será persistida antes do envio.** Uma Function lê uma intenção/outbox com idempotency key no Supabase, chama o parceiro e grava retorno; o navegador não contém segredo nem confirma o efeito externo por conta própria.
4. **Agendamento só inicia trabalho curto.** A agenda não é prova de conclusão, nem mecanismo de reconciliação: cada execução abre/atualiza um job rastreável.

## Validação visual de documentação Netlify

| Página | Observação confirmada no navegador | Reflexo no CRM |
| --- | --- | --- |
| Deploy Previews | A navegação oficial destaca proteção por senha, valores por contexto de deploy e colaboração/revisão de preview. | Mudanças de acesso, schema e workflows serão avaliadas em preview protegido, com checklist de cenário e aprovação técnica antes de produção. |
| Variáveis e Functions | A documentação distingue build, runtime, escopo de Functions e limitações de variáveis de ambiente. | Segredos de integração ficarão apenas no runtime de função/segredo da plataforma; frontend recebe apenas configuração pública mínima. |

## Captura 01A — Netlify: operação de funções, segredos e agenda

| Fonte oficial | Achado verificável | Decisão para o CRM | Limite ou cuidado |
| --- | --- | --- | --- |
| Netlify, *Functions overview* | Functions são versionadas, construídas e publicadas junto do site; versões ficam ligadas a deploys e podem usar previews e rollback. [13] | Uma função de borda ou servidor só é liberada com a mesma revisão do frontend, migration compatível, contexto de ambiente e roteiro de reversão. | Função não é fonte de verdade: o estado de negócio, idempotência e auditoria permanecem persistidos no Supabase. |
| Netlify, *Environment variables overview* | Variáveis suportam valores por contexto e por escopo; segredos podem ter controles adicionais, e alterações feitas por UI/CLI/API entram no audit log de time. [14] | Produção, homologação, preview e desenvolvimento terão projeto, chave e destino distintos; segredo de parceiro terá escopo mínimo de Function e rodízio documentado. | Arquivo de configuração não é cofre de segredo; precedência de contexto e override precisam de teste por ambiente. |
| Netlify, *Scheduled Functions* | Agendas são UTC, têm limite de 30 segundos, não usam payload/POST e só disparam automaticamente em deploy publicado; podem ser invocadas manualmente para teste. [15] | Agenda Netlify fica restrita a disparador curto, monitorado e idempotente; a tarefa durável é aberta no Supabase com `job_id`, dono e estado. | Não tratar execução agendada como conclusão, nem esperar que preview reproduza o agendamento automático. |
| Netlify, *Function logs* | Logs de Functions/Edge podem ser consultados por deploy e request; a retenção é limitada e o modo Lambda pode truncar saída histórica por invocação. [16] | Cada chamada crítica terá correlation ID, evento de domínio resumido e referência de auditoria persistida; logs de plataforma aceleram diagnóstico, mas não substituem ledger/audit trail. | Não colocar PII, documento, segredo, payload integral ou fato econômico irrestrito em log; retenção e exportação de telemetria precisam ser validadas por plano. |

## Decisões operacionais adicionais de Netlify

19. **Função acompanha release; fato acompanha transação.** Deploy e rollback de Function precisam ser correlacionados à versão do schema e à compatibilidade do comando de domínio.
20. **Segredo tem ambiente, escopo, owner e data de revisão.** Nenhuma chave crítica será compartilhada entre produção e preview, nem salva como valor de repositório.
21. **Agenda inicia; estado durável coordena.** O cron pode abrir uma execução curta; a fila/tabela de jobs no Supabase conserva tentativa, bloqueio, retry, resultado e operador.
22. **Log é pista, não prova definitiva.** A plataforma registra diagnóstico efêmero; o CRM retém audit event mínimo, referência de correlação e decisão de exceção sem despejar dado pessoal ou financeiro em texto de log.

## Captura 01B — Netlify: região, payload e escolha de runtime

| Fonte oficial | Achado verificável | Decisão para o CRM | Limite ou cuidado |
| --- | --- | --- | --- |
| Netlify, *Configuration for functions* | Funções síncronas têm limite padrão de 60 segundos, agendas 30 segundos e Background Functions 15 minutos; request/response buffered tem 6 MB e binários sofrem overhead de Base64. [17] | Upload de dossiê não passa por Function: cliente autorizado envia diretamente ao Storage privado por fluxo assinado/policy; Functions recebem apenas comando, metadado ou referência. | Não usar endpoint de Function como túnel de arquivo, fechamento, conciliação em massa ou processamento de PDF sem prova de capacidade. |
| Netlify, *Configuration for functions* | Região pode ser configurada por site/função; a decisão é orientada por proximidade de banco, público e residência de dados, e deploys anteriores mantêm sua configuração histórica. [17] | Região de Function será escolhida somente após comparar a região do projeto Supabase, latência medida, residência aplicável e dependência externa; a escolha entra no registro de arquitetura. | Não presumir que localização do usuário implica melhor região para comando que depende do Postgres; mudança de região exige redeploy e verificação de latência. |
| Netlify, *Background Functions overview* | Background Functions respondem `202`, executam até 15 minutos e tentam novamente após falha, sem resposta posterior ao cliente. [18] | Background Function pode executar um worker limitado que consome `job_id`/outbox já persistido; resultado, lock e tentativa continuam no banco. | Retry de plataforma não substitui deduplicação, lease, backoff de domínio, estado de dead-letter e reconciliação. |
| Netlify, *Edge Functions limits* | Edge Functions têm 50 ms de CPU por request, 512 MB de memória para o conjunto implantado e timeout de cabeçalho de 40 s; possuem restrições de reescrita, cache e recursos combinados. [19] | Edge fica limitado a roteamento, contexto leve, proteção de caminho e personalização segura; comandos financeiros, RLS, assinatura de callback e transformação pesada permanecem no Supabase/Function apropriada. | Não transformar Edge em camada de regra transacional ou origem de sessão/estado; rotas de Function e cache precisam de teste de colisão. |

## Decisões operacionais adicionais de runtime

23. **Arquivo vai ao cofre, não à Function.** O caminho de upload registra intenção e metadado, obtém autorização temporária e envia o binário ao Storage privado; a verificação de tipo/tamanho e o pós-processamento seguem como job controlado.
24. **Região é hipótese mensurável.** Função, Supabase e parceiros serão posicionados a partir de medições e obrigação aplicável, não por preferência visual de mapa; a escolha será versionada com teste de latência.
25. **Background não é worker permanente.** O trabalho de até 15 minutos pode ajudar em tarefas delimitadas, mas fila, lock, tentativa, deduplicação, retry e resultado permanecem duráveis no Supabase.
26. **Edge não decide fato econômico.** A borda pode reduzir latência de navegação e proteger rota; o banco e o comando transacional continuam a decidir estado, alçada e auditoria.

## Referências

[1] [Netlify Docs — Deploy Previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews/)

[2] [Netlify Docs — Environment variables and serverless functions](https://docs.netlify.com/build/functions/environment-variables/)

[3] [Netlify Docs — Background Functions overview](https://docs.netlify.com/build/functions/background-functions/)

[4] [Netlify Docs — Scheduled Functions](https://docs.netlify.com/build/functions/scheduled-functions/)

[13] [Netlify Docs — Functions overview](https://docs.netlify.com/build/functions/overview/)

[14] [Netlify Docs — Environment variables overview](https://docs.netlify.com/build/environment-variables/overview/)

[15] [Netlify Docs — Scheduled Functions](https://docs.netlify.com/build/functions/scheduled-functions/)

[16] [Netlify Docs — Function logs](https://docs.netlify.com/build/functions/logs/)

[17] [Netlify Docs — Configuration for functions](https://docs.netlify.com/build/functions/configuration/)

[18] [Netlify Docs — Background Functions overview](https://docs.netlify.com/build/functions/background-functions/)

[19] [Netlify Docs — Edge Functions limits](https://docs.netlify.com/build/edge-functions/limits/)

## Captura 02 — Supabase: dados, acesso e integração

| Fonte oficial | Achado verificável | Decisão para o CRM | Limite ou cuidado |
| --- | --- | --- | --- |
| Supabase, *Row Level Security* | RLS executa dentro do Postgres; tabelas expostas exigem RLS, grants e políticas por operação; `service_role` ignora RLS e deve ficar no servidor; políticas devem ter testes de permitir/negar. [5] | Todas as tabelas de domínio expostas à aplicação terão `organization_id`/escopo, RLS, grants mínimos, política por operação e teste de isolamento entre organizações, SPEs e papéis. | Uma view pode contornar RLS por padrão; `service_role` e funções `security definer` exigem revisão especial. |
| Supabase, *Edge Functions* | Funções TypeScript/Deno podem receber webhooks, integrar terceiros, usar segredos e emitir logs/métricas; devem ser curtas e idempotentes, com trabalho pesado deslocado a worker. [6] | Supabase Edge Functions serão receptoras de callback financeiro e endpoints de domínio que precisam de segredo, validação de assinatura e acesso transacional controlado. | Não executar reconciliação extensa ou processamento em lote no caminho síncrono; não passar segredo ao browser. |
| Supabase, *Database Webhooks* | Webhooks de banco disparam após `INSERT`, `UPDATE` ou `DELETE`, usando `pg_net` de forma assíncrona; há histórico no schema `net`. [7] | Eventos internos podem notificar integrações não críticas ou acionar um processador, mas a intenção/outbox precisa existir antes e registrar tentativa/resultado. | Mudança de linha já ocorreu quando o webhook dispara; não usar como única garantia de entrega nem como autorização de negócio. |
| Supabase, *Queues* | A documentação redireciona `pgmq` para Supabase Queues, uma fila gerenciada no Postgres. [8] | Avaliar fila durável no mesmo projeto para jobs de integração, backoff e reprocessamento de outbox. | Avaliar limites, retenção, semântica de entrega e monitoramento com teste de carga antes de adotar em produção. |

## Decisões provisórias de Supabase

5. **RLS é o cinto de segurança do produto.** A camada de interface melhora a experiência, mas o banco decide quem pode ler ou escrever cada linha. Membership, escopo de carteira, empresa/SPE, finalidade documental e alçada serão modelados como dados, não como `if` no frontend.
6. **RPC transacional para regra crítica.** Reserva, emissão de proposta, aprovação, transição de lote, entitlement, fechamento e aplicação de retorno entrarão por funções SQL/RPC versionadas, evitando múltiplas escritas parcialmente concluídas pelo cliente.
7. **Inbox, outbox e auditoria são entidades de domínio.** Callback externo é recebido, autenticado, deduplicado, persistido e correlacionado antes de alterar qualquer estado econômico; saída externa nasce em outbox com chave idempotente, tentativas e referência de retorno.
8. **Realtime é sinal de interface, não ledger.** Atualização de fila, reserva e presença pode usar assinatura em tempo real; o dado autoritativo continua no Postgres, com leitura de recuperação e regra de concorrência no banco.

## Captura 03 — Supabase: evidências, mudança e recuperação

| Fonte oficial | Achado verificável | Decisão para o CRM | Limite ou cuidado |
| --- | --- | --- | --- |
| Supabase, *Storage Access Control* | Buckets exigem políticas RLS em `storage.objects` para permitir operações; a service key ignora RLS e não pode ser pública. [9] | Dossiês usam buckets privados por domínio/organização, objeto com chave opaca e metadado em tabela de evidência; download depende de política e URL temporária assinada. | Não usar bucket público para RG, contrato, matrícula, extrato, comprovante, procuração ou documento de compliance. |
| Supabase, *Database migrations* | Migrations versionam schema e políticas; o fluxo local permite `db reset`, diff, push e sincronização de schemas de Auth e Storage. [10] | Tabela, RLS, grants, função SQL, trigger, bucket e política de Storage serão entregues em migration revisada e testada; alterações manuais de produção precisam ser capturadas. | Seed de teste nunca replica documento, PII ou evento financeiro de produção. |
| Supabase, *Database Backups* | Backups diários não incluem objetos do Storage; PITR tem pré-requisitos, custo e recuperação pode tornar o projeto inacessível durante o restore. [11] | Backups de banco, estratégia separada para arquivos, runbook de restauração e teste periódico entram no plano de operação. | Restore não é rollback simples de uma tabela e pode exigir downtime; retenção e RPO/RTO devem ser contratados/validados. |
| Supabase, *Multi-Factor Authentication* | MFA fornece TOTP/telefone, adiciona `aal` ao JWT e requer aplicação de regras também em banco/API; fluxos de enrollment e challenge precisam de UX própria. [12] | MFA será obrigatório para administradores, controladoria/contador, aprovadores e funções que movimentam configuração, evidência sensível, alçada ou instrução externa. | Colocar MFA na tela sem exigir `aal2` em RLS/função não protege a ação sensível. |

## Decisões provisórias adicionais

9. **Documento não é anexo público.** Acesso ao binário deverá depender de policy, finalidade, membership, papel, validade e, quando necessário, elevação de autenticação; a tabela de evidências registra quem anexou, revisou e acessou.
10. **Infraestrutura é código revisável.** Banco, acesso, buckets, índices, funções e jobs nascem em migrations; uma pull request não aprova só componente visual, aprova mudança de dado e regra.
11. **Recuperação precisa ser desenhada antes do incidente.** O CRM manterá snapshot de exportação/fechamento, backup externo de arquivos conforme política e ensaio de recuperação por ambiente, sem assumir que backup de banco restaura documentos.
12. **MFA é alçada de risco, não ornamento de login.** AAL2 protege operações de maior impacto; baixa latência comercial pode continuar em AAL1 onde a política permitir.

## Captura 04 — Supabase: produção, ambientes, migrations e telemetria

| Fonte oficial | Achado verificável | Decisão para o CRM | Limite ou cuidado |
| --- | --- | --- | --- |
| Supabase, *Production Checklist* | O checklist reúne RLS, SSL enforcement, network restrictions, MFA de organização, Security/Performance Advisor, teste de carga, SMTP próprio, PITR, rate limits e prevenção de abuso. [20] | O gate de produção terá owner de plataforma, revisão de Security/Performance Advisor, SSL/rede, MFA administrativa, carga em homologação, SMTP do domínio e orçamento de capacidade. | Configuração de plataforma não substitui RLS, teste de cenário ou avaliação de LGPD; limites de Auth, Realtime, SMTP e plano devem ser verificados no projeto escolhido. |
| Supabase, *Branching* | Cada branch possui instância e credenciais próprias; previews são efêmeros, branches persistentes atendem QA/staging, e novos ambientes começam sem dados da produção. [21] | Pull request de schema, RLS, Storage ou função é testado em ambiente isolado com seed sintético; homologação persistente recebe checklist de integração antes do merge. | Não copiar PII, dossiê, documento, retorno bancário ou contrato real para branch; credencial e destino de webhook de preview nunca apontam para produção. |
| Supabase, *Database Migrations* | Migrations rastreiam mudanças; alterações remotas manuais desviam o histórico e podem gerar falha de sincronização; reset/diff e status de migrations apoiam o fluxo de equipe. [22] | Todo schema, índice, grant, RLS, função SQL, trigger, bucket e policy nasce em arquivo de migration revisado, testado e aplicado por pipeline controlado. | `migration repair` corrige histórico, não reverte/aplica SQL; somente usar após inspeção do estado real e aprovação técnica. |
| Supabase, *Logging* | Logs são separados por API, Postgres, Auth, Storage, Realtime e Edge Functions; retenção depende do plano e mensagens podem ser truncadas; pgAudit permite recorte de auditoria no Postgres. [23] | Telemetria usa correlation ID, fontes separadas e consultas por jornada; auditoria de domínio fica em tabela própria, e pgAudit é avaliado para operações administrativas específicas. | Não registrar PII/payload sem necessidade; logging amplo produz custo/ruído e logs de plataforma não substituem fatos de domínio nem retenção legal. |

## Decisões operacionais adicionais de Supabase

13. **Branch é ambiente, não cópia de produção.** Preview e QA recebem schema, policy, segredo e seed próprios; o teste de migration deve provar upgrade, autorização e comportamento de integração sem tocar dados reais.
14. **Migration é a única história de schema.** Operação manual remota é exceção de incidente e exige captura imediata, reconciliação e revisão — nunca fluxo normal de desenvolvimento.
15. **Produção é um conjunto de gates.** Segurança, rede, MFA, Auth, e-mail, performance, carga, backup, SLO e ownership precisam estar explícitos antes de permitir dado sensível ou integração financeira.
16. **Observabilidade acompanha a jornada.** API, banco, função, Storage e Auth guardam pistas de diagnóstico; o CRM acrescenta correlação e audit event mínimo para explicar a decisão sem usar log como repositório de dados pessoais.

## Captura 05 — Supabase: runtime, webhook, upload e Realtime

| Fonte oficial | Achado verificável | Decisão para o CRM | Limite ou cuidado |
| --- | --- | --- | --- |
| Supabase, *Edge Functions limits* | Edge Functions hospedadas têm memória, CPU, duração, tamanho, segredo e taxa de log limitados; bibliotecas com multithreading não são suportadas. [24] | Endpoint de domínio e callback será curto, validará entrada, persistirá estado e delegará trabalho maior a job/fila; PDF, imagem e lote pesado não entram no caminho de Function. | Limite de runtime não é SLA de negócio; medição de duração, erro, fila e backpressure decide se o fluxo precisa ser redesenhado. |
| Supabase, *Securing Edge Functions* | Modos distintos protegem chamada de usuário, serviço, chave publicável ou endpoint sem credencial; webhook externo exige validar assinatura própria no handler quando a checagem JWT é desativada. [25] | Chamadas de usuário preservam JWT e RLS; job interno usa segredo nomeado e escopo mínimo; callback financeiro conserva body bruto, assinatura, correlação, inbox e deduplicação antes de usar privilégio. | `auth: none` não significa endpoint seguro; sem assinatura/replay guard/limite de origem, nenhuma leitura ou escrita sensível é permitida. |
| Supabase, *Resumable Uploads* | TUS permite upload retomável, URL temporária, progresso e concorrência controlada; é recomendado para arquivos grandes/instáveis e aconselha path novo em vez de sobrescrita. [26] | Dossiê usa intenção de upload, objeto com chave opaca/nova versão, metadado de evidência e política RLS; cliente retoma envio sem atravessar Function e a conclusão abre verificação posterior. | URL de upload expira, concorrência pode gerar conflito e `upsert` não pode apagar a versão histórica; tipo, tamanho, hash e acesso continuam sendo regra de domínio. |
| Supabase, *Realtime Limits* | Conexões, joins, mensagens e payloads são limitados por projeto/plano; ao exceder, canais podem ser recusados ou desconectados e payload de mudança pode ser truncado. [27] | Realtime notifica fila, reserva e atualização visual; a tela refaz leitura autorizada e o Postgres decide a verdade. Métricas de conexão/mensagem e fallback de reconexão entram no teste de carga. | Não carregar ledger, documento, payload grande ou confirmação financeira no socket; toda ação crítica possui leitura/consulta de recuperação. |

## Decisões operacionais adicionais de fluxo

17. **Webhook externo é um caso de segurança específico.** O handler só registra o payload depois de validar assinatura, horário/replay quando suportado, origem, correlação e unicidade; qualquer efeito econômico passa por comando transacional posterior.
18. **Upload é uma jornada, não um campo de formulário.** Iniciar, enviar, concluir, escanear/validar, vincular, revisar, expirar e revogar são estados separados, cada qual com autorização e audit event.
19. **Realtime acelera leitura; não confirma negócio.** A interface reage a sinal e consulta a fonte autorizada; reserva, aprovação, recebimento e distribuição exigem transação e estado persistido.
20. **Limite aciona desenho, não improviso.** Quando tamanho, CPU, duração, conexão ou custo exceder a evidência de capacidade, o item volta ao desenho de fila, arquivo, integração ou serviço especializado antes do release.

## Captura 06 — Supabase: conexão, RLS testável e qualidade de banco

| Fonte oficial | Achado verificável | Decisão para o CRM | Limite ou cuidado |
| --- | --- | --- | --- |
| Supabase, *Connect to your database* | Conexão direta atende migrations e sessões persistentes; pooler em modo transação é indicado para funções serverless/edge e não suporta prepared statements. [28] | Navegador usa Data API sob RLS; Function/worker efêmero usa caminho de conexão compatível com pooler; migration, backup e administração usam conexão direta em pipeline controlado. | Não usar URL de conexão direta no browser, nem driver com prepared statements ativados no modo transação; medir pool, conexões e latência antes de mudar tier/pooler. |
| Supabase, *Row Level Security* | RLS exige grants e policies; cada tabela exposta deve ter testes permitir/negar por operação, views requerem cuidado e colunas de policy pedem índice apropriado. [29] | Toda tabela exposta recebe migration conjunta de RLS, grants mínimos, policy separada por operação, índice de escopo e teste pgTAP com membro, não membro, administrador e contexto de SPE/carteira quando aplicável. | `service_role` ignora RLS; JWT pode estar defasado e metadado mutável pelo usuário não deve sustentar autorização. View/RPC/`security definer` entram em revisão reforçada. |
| Supabase, *Testing and linting* | CLI suporta testes de banco com pgTAP, testes de Edge Functions, captura local de e-mail e lint de PL/pgSQL para tipos, casts, código morto e riscos em `EXECUTE`. [30] | Pipeline executa reset/migrations, testes RLS, testes de RPC, teste de função/webhook, lint de banco e casos de e-mail antes de homologação; falha bloqueia release. | Lint não prova regra de negócio ou carga; suite precisa de dados sintéticos representativos, teste de concorrência e critérios explícitos de aprovação. |

## Decisões operacionais adicionais de banco

21. **Conexão segue o ciclo de vida do processo.** Processo efêmero usa pooler de transação e driver compatível; comando administrativo usa conexão direta controlada; a interface não recebe credencial de banco.
22. **Policy sem teste é hipótese.** Cada `SELECT`, `INSERT`, `UPDATE` e `DELETE` relevante prova acesso autorizado e bloqueio de membro externo, papel insuficiente e escopo errado, além de preservar a linha após tentativa negada.
23. **Performance de autorização é requisito de schema.** Colunas usadas em policy e filtro de multi-tenancy entram no desenho de índice e no plano de carga, não em otimização tardia.
24. **Migration aprova regra, não só tabela.** Um pull request de dado inclui alteração de schema, grants, RLS, função, seed sintético, teste, lint, impacto de lock e plano de compatibilidade/rollback.

## Captura 07 — Supabase: webhooks, fila e execução assíncrona

| Fonte oficial | Achado verificável | Decisão para o CRM | Limite ou cuidado |
| --- | --- | --- | --- |
| Supabase, *Database Webhooks* | Webhooks de banco decorrem de trigger/`pg_net`, são assíncronos e disparam após mudança de linha; histórico de chamadas é acessível no schema `net`. [31] | Database webhook pode acordar processador secundário ou alimentar observabilidade, mas a intenção/outbox nasce na mesma transação do fato e conserva estado próprio de entrega. | Webhook não reverte a escrita já feita nem prova que o terceiro concluiu; não é autorização de negócio, nem substitui retry/reconciliação. |
| Supabase, *Queues* | Queues usam `pgmq`, armazenam mensagens no Postgres, possuem entrega garantida, visibilidade configurável, arquivamento, monitoramento e autorização por API/RLS. [32] | Outbox crítico, retry de callback, importação, geração de lote e verificação de documento avaliam fila durável com envelope versionado, `job_id`, idempotency key, lock/visibilidade, erro e arquivamento. | “Entrega exatamente uma vez” dentro da janela não elimina idempotência de efeito externo; consumidor precisa gravar tentativa/resultado e tratar mensagem venenosa. |
| Supabase, *Background Tasks* | `EdgeRuntime.waitUntil` permite trabalho fora da resposta, porém segue os limites de memória/CPU/duração da Function e não se completa automaticamente no ambiente local padrão. [33] | `waitUntil` é permitido apenas para efeito secundário curto e reexecutável — por exemplo, telemetria ou despertar de job já persistido. | Não confiar em tarefa em memória para callback, split, conciliação, documento ou qualquer efeito que exija garantia de execução/replay. |
| Supabase, *pg_cron / Cron* | Jobs recorrentes podem ser programados no Postgres; a plataforma direciona o uso para a superfície específica de Cron. [34] | Cron só verifica itens vencidos, abre jobs e mede condição; a execução real preserva lock, tentativa, alçada e resultado em entidades de domínio/fila. | Agenda não é mecanismo de fechamento fiscal/financeiro definitivo, nem deve executar alteração pesada sem janela, monitoramento e recuperação definidos. |

## Decisões operacionais adicionais de integração

25. **Evento não é efeito.** A transação cria fato, audit event e outbox; a fila entrega comando; o consumidor produz tentativa; a resposta externa entra por inbox; reconciliação decide o estado confirmado.
26. **Fila tem contrato e relógio.** Cada mensagem declara versão, producer, consumer, chave de idempotência, correlação, limite de tentativa, visibilidade, destino de falha e critério de arquivamento.
27. **Agendamento mede e inicia; não presume êxito.** Tarefa periódica apenas descobre trabalho elegível, cria job único e emite sinal; execução, falha e reprocessamento são rastreáveis fora do cron.
28. **Assíncrono curto não substitui durabilidade.** `waitUntil`, Background Function e webhook reduzem latência percebida, mas estado de negócio e recuperação precisam sobreviver ao runtime, deploy e falha parcial.

## Validação de documentação Supabase

| Página | Observação confirmada no navegador | Reflexo no CRM |
| --- | --- | --- |
| Row Level Security | A documentação organiza RLS junto de grants, testes por operação, performance, roles, secrets e auditoria; reforça que controle de acesso é parte do esquema. | A definição de cada tabela inclui política, índice de filtro de policy, teste de permitir/negar e owner técnico, não apenas uma permissão em tela. |
| Storage Access Control | A documentação confirma que upload, leitura, alteração e exclusão são operações distintas em `storage.objects`, e que service key ignora RLS. | O modelo de evidência separa anexar, listar, visualizar, substituir e expirar documento; nenhuma chave privilegiada é distribuída ao aplicativo cliente. |

[9] [Supabase Docs — Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)

[10] [Supabase Docs — Database migrations](https://supabase.com/docs/guides/local-development/database-migrations)

[11] [Supabase Docs — Database Backups](https://supabase.com/docs/guides/platform/backups)

[12] [Supabase Docs — Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa)

[20] [Supabase Docs — Production Checklist](https://supabase.com/docs/guides/deployment/going-into-prod)

[21] [Supabase Docs — Branching](https://supabase.com/docs/guides/deployment/branching)

[22] [Supabase Docs — Database Migrations](https://supabase.com/docs/guides/deployment/database-migrations)

[23] [Supabase Docs — Logging](https://supabase.com/docs/guides/monitoring-and-debugging/logs)

[24] [Supabase Docs — Edge Functions limits](https://supabase.com/docs/guides/functions/limits)

[25] [Supabase Docs — Securing Edge Functions](https://supabase.com/docs/guides/functions/auth)

[26] [Supabase Docs — Resumable Uploads](https://supabase.com/docs/guides/storage/uploads/resumable-uploads)

[27] [Supabase Docs — Realtime Limits](https://supabase.com/docs/guides/realtime/limits)

[28] [Supabase Docs — Connect to your database](https://supabase.com/docs/guides/database/connecting-to-postgres)

[29] [Supabase Docs — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

[30] [Supabase Docs — Testing and linting](https://supabase.com/docs/guides/local-development/cli/testing-and-linting)

[31] [Supabase Docs — Database Webhooks](https://supabase.com/docs/guides/database/webhooks)

[32] [Supabase Docs — Queues](https://supabase.com/docs/guides/queues)

[33] [Supabase Docs — Background Tasks](https://supabase.com/docs/guides/functions/background-tasks)

[34] [Supabase Docs — pg_cron](https://supabase.com/docs/guides/database/extensions/pg_cron)

[5] [Supabase Docs — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

[6] [Supabase Docs — Edge Functions](https://supabase.com/docs/guides/functions)

[7] [Supabase Docs — Database Webhooks](https://supabase.com/docs/guides/database/webhooks)

[8] [Supabase Docs — Queues](https://supabase.com/docs/guides/queues)
