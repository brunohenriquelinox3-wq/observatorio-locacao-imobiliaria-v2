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

## Referências

[1] [Netlify Docs — Deploy Previews](https://docs.netlify.com/deploy/deploy-types/deploy-previews/)

[2] [Netlify Docs — Environment variables and serverless functions](https://docs.netlify.com/build/functions/environment-variables/)

[3] [Netlify Docs — Background Functions overview](https://docs.netlify.com/build/functions/background-functions/)

[4] [Netlify Docs — Scheduled Functions](https://docs.netlify.com/build/functions/scheduled-functions/)

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

## Validação de documentação Supabase

| Página | Observação confirmada no navegador | Reflexo no CRM |
| --- | --- | --- |
| Row Level Security | A documentação organiza RLS junto de grants, testes por operação, performance, roles, secrets e auditoria; reforça que controle de acesso é parte do esquema. | A definição de cada tabela inclui política, índice de filtro de policy, teste de permitir/negar e owner técnico, não apenas uma permissão em tela. |
| Storage Access Control | A documentação confirma que upload, leitura, alteração e exclusão são operações distintas em `storage.objects`, e que service key ignora RLS. | O modelo de evidência separa anexar, listar, visualizar, substituir e expirar documento; nenhuma chave privilegiada é distribuída ao aplicativo cliente. |

[9] [Supabase Docs — Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)

[10] [Supabase Docs — Database migrations](https://supabase.com/docs/guides/local-development/database-migrations)

[11] [Supabase Docs — Database Backups](https://supabase.com/docs/guides/platform/backups)

[12] [Supabase Docs — Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa)

[5] [Supabase Docs — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

[6] [Supabase Docs — Edge Functions](https://supabase.com/docs/guides/functions)

[7] [Supabase Docs — Database Webhooks](https://supabase.com/docs/guides/database/webhooks)

[8] [Supabase Docs — Queues](https://supabase.com/docs/guides/queues)
