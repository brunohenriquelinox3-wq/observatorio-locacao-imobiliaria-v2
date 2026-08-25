# Descoberta de infraestrutura Supabase — Subetapa 0.2

**Data da inspeção:** 25 de agosto de 2026  
**Finalidade:** escolher um ambiente seguro para a fundação administrativa antes de qualquer DDL, migration ou bootstrap.

## Estado encontrado

Foi identificado um projeto Supabase ativo e saudável, já associado ao trabalho do CRM. Ele possui um conjunto extenso de tabelas públicas com RLS habilitada. Duas tabelas já contêm dados: a tabela de locatárias possui **1 linha** e a tabela de usuários possui **2 linhas**. As demais tabelas inspecionadas não têm linhas, mas representam múltiplos domínios já planejados: loteamento, locação, venda urbana, financeiro, fiscal, cobrança, marketing e painéis administrativos.

> **Decisão de segurança:** nenhuma migration da nova fundação administrativa será aplicada nesse projeto até que o usuário escolha explicitamente entre extensão controlada do ambiente existente e ambiente/branch de desenvolvimento isolado.

## Implicação arquitetural

O projeto full-stack local foi habilitado para fornecer runtime, autenticação e estrutura de painel. Porém, o template gerado usa MySQL/TiDB como banco padrão, o que não substitui o plano aprovado de **Supabase Postgres + Auth + RLS**. O Supabase permanece a autoridade prevista para dados, políticas e identidade da aplicação.

## Próxima decisão requerida

| Alternativa | Vantagem | Risco/condição |
| --- | --- | --- |
| Estender o projeto Supabase existente | Reutiliza o ambiente e esquemas já iniciados. | Exige auditoria detalhada de migrations, convenções e políticas antes de qualquer alteração. |
| Criar branch de desenvolvimento Supabase | Isola migrations e testes sem tocar dados existentes. | Pode ter custo; requer consulta e confirmação explícita do valor antes da criação. |
| Criar projeto Supabase de desenvolvimento separado | Isolamento máximo para a fundação. | Também exige consulta de custo, confirmação e escolha de organização/região. |

Nenhuma das alternativas ativa o principal inicial, cria dados de produção ou concede privilégios por si só.

## Ambiente isolado aprovado e criado

Após confirmação explícita de custo, foi criado o projeto Supabase de desenvolvimento **`crm-imobiliario-admin-dev`**, em **`sa-east-1` (São Paulo)**, com referência `guvwjiakmpcoysedcgpz` e estado `ACTIVE_HEALTHY`. Ele será o único alvo de migrations, testes de RLS e dados sintéticos da fundação administrativa até uma decisão posterior de promoção.

O projeto não recebeu ainda tabelas do domínio administrativo, dados operacionais, secrets de aplicação ou bootstrap do principal privilegiado. A próxima ação será uma inspeção somente leitura do ambiente recém-criado, seguida da apresentação da migration inicial para aprovação.

## Foundation A0 aplicada e verificada

Com aprovação explícita, foram aplicadas no ambiente isolado as migrations versionadas `admin_foundation_a0` e `admin_explicit_deny_policies_a0_1`. Elas criaram somente as estruturas `organizations`, `identity_subjects`, `organization_memberships`, `administrative_grants`, `platform_principals`, `access_invitations` e `admin_audit_events`, além de tipos, checks, vínculos e índices mínimos.

Todas as tabelas nasceram sem linhas, com RLS habilitada, privilégios diretos revogados para `anon` e `authenticated` e policies explícitas de negação. A consulta posterior ao advisor de segurança do Supabase não retornou avisos. Não foram inseridos dados, criados convites, configurados segredos de aplicação, emitidos tokens ou ativado o principal inicial.

> **Próximo limite:** a próxima subetapa poderá conectar a aplicação ao projeto de desenvolvimento e construir a Central de Plataforma em estado vazio. Ela ainda não poderá executar provisionamento, grant, revogação ou bootstrap sem migrations de comandos, testes e nova aprovação.
