# Matriz operacional de prontidão — Netlify + Supabase

## Versão 0.1 — agosto de 2026

Este documento transforma a escolha de **Netlify + Supabase** em uma disciplina de implementação. Ele não afirma que uma plataforma elimina erro; define, em vez disso, as condições verificáveis que reduzem suposições antes de cada ambiente, migration, política, integração ou publicação. A arquitetura continua respeitando as fronteiras do CRM: a aplicação organiza relações, fatos, evidências e decisões; instituições financeiras, ERPs, órgãos e profissionais habilitados conservam as responsabilidades que lhes cabem.

> **Regra de prontidão:** uma capacidade não está “pronta” por existir em uma demonstração. Ela precisa ter fonte de verdade, escopo de acesso, teste positivo e negativo, sinal operacional, owner, reversão e evidência de aprovação.

## 1. Frentes de especialização e validação

| Frente | Pergunta de domínio | Resultado obrigatório | Escopo de investigação |
| --- | --- | --- | --- |
| Entrega Netlify | Como a mudança chega a cada ambiente sem expor segredo ou dado real? | Estratégia de branch, preview, ambiente, variável, rollback e owner. | Build, previews, deploy, Functions, Edge, cache, logs e limites. |
| Dados Supabase | Como o modelo canônico evolui sem corromper histórico ou escopo? | Schema versionado, migration testada, ownership, transação e plano de reversão. | Postgres, schemas, constraints, índices, migrations e observabilidade. |
| Acesso Supabase | Como identidade, membership, RLS e alçada resistem a uma chamada direta? | Matriz permitir/negar por papel, organização, SPE, carteira, objeto e ação. | Auth, MFA, JWT/claims, RLS, RPC, grants e auditoria. |
| Evidência e Storage | Como documentos privados permanecem acessíveis apenas pela finalidade autorizada? | Política de bucket, metadado, URL temporal, retenção, revogação e teste de download. | Storage, objetos, versionamento, hash, legal hold e acesso assinado. |
| Integração | Como callback, exportação e comando externo não duplicam ou perdem um fato? | Contrato de evento, inbox/outbox, assinatura, idempotência, reconciliação e replay. | Funções, webhooks, filas, segredos, correlação e exceção. |
| Operação | Como a equipe detecta, explica e recupera uma falha? | SLI/SLO, dashboard, alerta acionável, runbook, teste de restore e postmortem. | Logs, traces, métricas, backups, recuperação e gestão de custo. |
| Escala e mudança | Como o crescimento não quebra segurança, custo ou qualidade? | Orçamento, teste de carga, limites registrados e gate de expansão. | Capacidade, concorrência, quotas, conexão, egress e retenção. |

## 2. Limites técnicos que a implementação deve respeitar

O navegador pode usar somente identificadores e credenciais públicos previstos para cliente; segredos de administração, parceiros, assinatura de webhook e chaves de privilégio nunca entram no bundle. Netlify deve entregar a interface e acolher endpoints de borda ou funções quando a política de segredo e o caminho de solicitação justificarem essa camada. Supabase deve manter o dado de domínio, as políticas, as transações e o Storage; uma credencial de serviço é exceção altamente restrita, registrada e inacessível ao navegador.

| Decisão | Padrão inicial | Proibição explícita | Evidência de aprovação |
| --- | --- | --- | --- |
| Leitura de CRM | Cliente autenticado sob RLS e vistas/consultas deliberadas. | Expor tabela operacional irrestrita ou depender de filtro somente na tela. | Caso permitir/negar automatizado e revisão de policy. |
| Comando crítico | RPC/função transacional ou endpoint seguro com alçada, estado e audit event. | Múltiplas mutações independentes feitas pelo navegador. | Teste de concorrência, idempotência e reversão. |
| Documento sensível | Bucket privado, metadado no domínio, acesso temporal por finalidade. | URL pública estável, arquivo sem owner/retention ou acesso por nome previsível. | Teste de acesso autorizado, negado e revogado. |
| Callback de parceiro | Endpoint autenticado, inbox único, correlação, deduplicação e reconciliação. | Tratar um callback como ordem direta de liquidação/contrato. | Registro do payload, assinatura, replay e caso de divergência. |
| Job e processamento | Trabalho curto no ambiente adequado; fila e estado durável para repetição/recuperação. | Processo em memória como fonte de verdade ou polling invisível. | Timeout, retry, dead-letter/pendência e owner definidos. |
| Mudança de schema/policy | Migration revisada em ambiente representativo, compatível e versionada. | Alterar produção manualmente, sem snapshot, teste ou rollback. | Pipeline, migration aplicada, verificação pós-mudança e plano de correção. |

## 3. Critério de saída por capacidade

Cada item de backlog técnico deverá carregar os oito campos abaixo. A ausência de qualquer campo impede o item de ser classificado como pronto para produção, ainda que a tela pareça funcionar.

1. **Finalidade e domínio:** qual fato de negócio a capacidade atende e qual fonte de verdade ela toca.
2. **Escopo e autorização:** quem pode ler, escrever, aprovar, exportar ou recuperar, em qual organização e contexto.
3. **Contrato:** entrada, saída, versão, validação, correlação e comportamento diante de repetição.
4. **Teste:** cenário permitido, cenário negado, exceção, concorrência e regressão aplicáveis.
5. **Observabilidade:** evento, métricas, log seguro, alerta e owner de investigação.
6. **Recuperação:** rollback, compensação, replay, restore ou procedimento de interrupção segura.
7. **Capacidade e custo:** volume presumido, limite conhecido, alerta de consumo e ponto de reavaliação.
8. **Evidência de gate:** revisão técnica, aprovação de domínio e resultado de homologação anexados.

## 4. Ordem de aprendizado aplicada

O estudo será executado nesta ordem para impedir que recursos atraentes sejam recomendados antes da base: primeiro, os limites oficiais de cada plataforma; depois, os fluxos de integração cruzada; em seguida, os controles de testes, recovery e custo; por fim, a conversão em arquitetura, backlog, runbook e demonstração de estratégia. A documentação oficial é a fonte para fatos de produto e limite; uma decisão de CRM só será promovida depois de confrontada com o domínio imobiliário, a estratégia financeira e um piloto futuro.

## 5. Status inicial

| Dimensão | Estado atual | Próxima prova exigida |
| --- | --- | --- |
| Arquitetura conceitual | Estruturada | Converter fronteiras em matriz de escolha por fluxo. |
| Segurança de dados | Direção definida | Testes concretos de RLS, RPC, Storage e segredo. |
| Integrações | Padrão inbox/outbox definido | Contrato de referência com callback e replay em sandbox. |
| Operação | Princípios definidos | SLO, alertas, runbooks e teste de recuperação. |
| Capacidade/custo | Hipótese aberta | Limites atuais, orçamento e teste de carga por jornada. |

## 6. Artefatos vinculados

| Artefato | Papel na decisão |
| --- | --- |
| [Protocolo Netlify + Supabase](crm_netlify_supabase_metodologia.md) | Perguntas, fronteiras e critérios iniciais. |
| [Arquitetura de referência](arquitetura_crm_netlify_supabase.md) | Mapa de componentes, dados, eventos e ondas. |
| [Evidências Netlify + Supabase](crm_netlify_supabase_evidencias.md) | Caderno de fontes oficiais e cautelas verificadas. |
| [Auditoria estratégica](auditoria_estrategia_crm_relatorio.md) | Riscos, owners, gates e linha mestra de evolução. |
