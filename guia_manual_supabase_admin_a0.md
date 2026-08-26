# Manual completo — Fundação administrativa A0 no Supabase

**Destino oficial:** projeto Supabase com referência `mjgrloxzvmnrvrgiagbv`.  
**Escopo:** aplicar somente as migrations `A0` e `A0.1` da fundação administrativa.  
**Resultado esperado:** tabelas administrativas vazias, RLS habilitada e negação explícita de acesso direto para `anon` e `authenticated`.

> **Este manual não cria o Super Admin, não insere usuários, não envia convites, não ativa MFA, não concede acesso e não toca em dados imobiliários ou financeiros.** Ele instala apenas a estrutura que permitirá construir esses fluxos depois, com novas aprovações e testes.

## 1. O que será aplicado

| Arquivo | Função | Efeito permitido | Efeito proibido |
| --- | --- | --- | --- |
| `20260825180000_admin_foundation_a0.sql` | Cria os tipos, tabelas, índices, checks, RLS e revoga grants diretos. | Estrutura vazia de organizações, memberships, grants, convites e trilha administrativa. | Dados, bootstrap, sessão, e-mail, token, painel ou comando de produção. |
| `20260825180500_admin_explicit_deny_policies_a0_1.sql` | Cria policies explícitas `using (false)` / `with check (false)`. | Evidencia no banco que navegador e usuários autenticados não acessam as tabelas diretamente. | Qualquer política de leitura/gravação para clientes, admins ou operadores. |

As migrations foram escritas para PostgreSQL/Supabase, usam transações no modo de aplicação proposto e assumem um banco sem esse schema administrativo. O fluxo usa apenas o cliente `psql`; não exige entregar senha ou chave a terceiros.

## 2. Pré-requisitos locais

Você precisa estar no computador que terá acesso ao banco do projeto oficial. Verifique o cliente PostgreSQL:

```bash
psql --version
```

| Sistema | Instalação sugerida |
| --- | --- |
| macOS com Homebrew | `brew install libpq` e, se necessário, adicione o diretório `bin` do `libpq` ao `PATH`. |
| Ubuntu/Debian | `sudo apt update && sudo apt install postgresql-client`. |
| Windows | Instale o cliente PostgreSQL oficial ou use o terminal que acompanha a instalação. |

Também deixe os dois arquivos de migration em uma pasta local. Você pode baixá-los da área **Code** do projeto Manus ou copiá-los deste pacote para, por exemplo, `~/crm-admin-migrations`.

```bash
mkdir -p ~/crm-admin-migrations
cd ~/crm-admin-migrations
ls -la
```

O comando `ls` deve mostrar exatamente:

```text
20260825180000_admin_foundation_a0.sql
20260825180500_admin_explicit_deny_policies_a0_1.sql
```

## 3. Conexão segura sem colocar senha no histórico

O host oficial do banco é `db.mjgrloxzvmnrvrgiagbv.supabase.co`. Configure apenas metadados de conexão; a senha será solicitada pelo `psql` com `-W` e não precisa entrar em variável, arquivo, terminal compartilhado ou conversa.

### macOS, Linux ou WSL

```bash
export PGHOST='db.mjgrloxzvmnrvrgiagbv.supabase.co'
export PGPORT='5432'
export PGDATABASE='postgres'
export PGUSER='postgres'
export PGSSLMODE='require'
```

### PowerShell no Windows

```powershell
$env:PGHOST = 'db.mjgrloxzvmnrvrgiagbv.supabase.co'
$env:PGPORT = '5432'
$env:PGDATABASE = 'postgres'
$env:PGUSER = 'postgres'
$env:PGSSLMODE = 'require'
```

> Use a **senha do banco** definida para o projeto Supabase, não a senha da sua conta Supabase, não a chave `sb_publishable_...`, não a `anon key` e não a secret key de API. A secret key é própria para chamadas server-side HTTP; este roteiro usa a senha PostgreSQL somente no seu terminal.

## 4. Verificação de destino antes de alterar qualquer coisa

Rode o comando abaixo. O `-W` fará o `psql` pedir a senha de forma oculta. Confirme que o resultado contém `postgres` como banco e usuário, e que o host resolve para o projeto escolhido.

```bash
psql -X -W -v ON_ERROR_STOP=1 -c "
  select
    current_database() as database_name,
    current_user as database_user,
    inet_server_addr() as server_address,
    version() as postgres_version;
"
```

| Se acontecer | Faça isto | Não faça isto |
| --- | --- | --- |
| O comando pede senha e conclui com uma linha de resultado. | Continue para a seção 5. | Não cole a senha no chat. |
| `password authentication failed`. | Redefina ou confirme a senha do banco no Supabase e repita somente a verificação. | Não troque a chave publishable pela senha. |
| `could not translate host name` ou timeout. | Confirme conexão de internet, host e regras de rede; teste outra rede se necessário. | Não remova `sslmode=require`. |
| O banco/usuário não correspondem ao esperado. | Pare e revise as variáveis; não aplique migration. | Não “tente assim mesmo”. |

## 5. Inspecione se o schema administrativo já existe

Este passo previne reaplicar uma migration parcial, manual ou já existente. Ele não modifica o banco.

```bash
psql -X -W -v ON_ERROR_STOP=1 -c "
  select table_schema, table_name
  from information_schema.tables
  where table_schema = 'public'
    and table_name in (
      'organizations',
      'identity_subjects',
      'organization_memberships',
      'administrative_grants',
      'platform_principals',
      'access_invitations',
      'admin_audit_events'
    )
  order by table_name;
"
```

**Resultado esperado antes da primeira aplicação:** nenhuma linha. Se aparecer uma ou mais tabelas, **pare**. Informe apenas os nomes das tabelas existentes; não execute a migration novamente e não apague objetos por conta própria.

## 6. Aplicar A0 de modo atômico

Entre na pasta que contém os arquivos e execute A0 com `--single-transaction`. Se qualquer instrução falhar, o PostgreSQL desfaz as instruções daquele arquivo; assim não fica uma fundação A0 parcialmente criada.

```bash
cd ~/crm-admin-migrations

psql -X -W \
  --single-transaction \
  -v ON_ERROR_STOP=1 \
  -f 20260825180000_admin_foundation_a0.sql
```

O terminal deve emitir comandos como `CREATE SCHEMA`, `CREATE TYPE`, `CREATE TABLE`, `CREATE INDEX`, `ALTER TABLE` e `REVOKE`. Não deve haver `INSERT`, `UPDATE`, `DELETE`, `CREATE USER`, `GRANT` para `anon/authenticated` ou chamadas de e-mail.

Se o comando retornar erro, **não execute A0.1** e não repita A0 até entender a mensagem. Guarde somente o texto do erro — nunca a senha — e informe que falhou.

## 7. Aplicar A0.1 de modo atômico

Somente depois de A0 concluir sem erro, aplique a policy explícita de negação:

```bash
psql -X -W \
  --single-transaction \
  -v ON_ERROR_STOP=1 \
  -f 20260825180500_admin_explicit_deny_policies_a0_1.sql
```

O resultado esperado são sete comandos `CREATE POLICY`. Não deve haver nenhum `GRANT`, `INSERT`, `UPDATE`, `DELETE`, convite ou alteração em `auth.users`.

## 8. Verificação pós-aplicação

### 8.1 Confirmar as sete tabelas

```bash
psql -X -W -v ON_ERROR_STOP=1 -c "
  select table_name
  from information_schema.tables
  where table_schema = 'public'
    and table_name in (
      'organizations',
      'identity_subjects',
      'organization_memberships',
      'administrative_grants',
      'platform_principals',
      'access_invitations',
      'admin_audit_events'
    )
  order by table_name;
"
```

**Esperado:** exatamente sete linhas, uma para cada tabela listada.

### 8.2 Confirmar que RLS está ativa

```bash
psql -X -W -v ON_ERROR_STOP=1 -c "
  select c.relname as table_name, c.relrowsecurity as rls_enabled
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (
      'organizations',
      'identity_subjects',
      'organization_memberships',
      'administrative_grants',
      'platform_principals',
      'access_invitations',
      'admin_audit_events'
    )
  order by c.relname;
"
```

**Esperado:** sete linhas com `rls_enabled = t`.

### 8.3 Confirmar as policies de negação

```bash
psql -X -W -v ON_ERROR_STOP=1 -c "
  select tablename, policyname, roles, cmd
  from pg_policies
  where schemaname = 'public'
    and policyname like '%_deny_direct_access'
  order by tablename;
"
```

**Esperado:** sete linhas, todas com `cmd = ALL` e nomes terminados em `_deny_direct_access`.

### 8.4 Confirmar que não há linhas de domínio

```bash
psql -X -W -v ON_ERROR_STOP=1 -c "
  select 'organizations' as entity, count(*) as records from public.organizations
  union all select 'identity_subjects', count(*) from public.identity_subjects
  union all select 'organization_memberships', count(*) from public.organization_memberships
  union all select 'administrative_grants', count(*) from public.administrative_grants
  union all select 'platform_principals', count(*) from public.platform_principals
  union all select 'access_invitations', count(*) from public.access_invitations
  union all select 'admin_audit_events', count(*) from public.admin_audit_events
  order by entity;
"
```

**Esperado:** sete linhas com `records = 0`.

### 8.5 Confirmar ausência de grants diretos ao browser

```bash
psql -X -W -v ON_ERROR_STOP=1 -c "
  select grantee, table_name, privilege_type
  from information_schema.role_table_grants
  where table_schema = 'public'
    and grantee in ('anon', 'authenticated')
    and table_name in (
      'organizations',
      'identity_subjects',
      'organization_memberships',
      'administrative_grants',
      'platform_principals',
      'access_invitations',
      'admin_audit_events'
    )
  order by table_name, grantee, privilege_type;
"
```

**Esperado:** nenhuma linha.

## 9. O que fazer em cada resultado

| Resultado | Significado | Próxima ação |
| --- | --- | --- |
| As verificações 8.1–8.5 batem com o esperado. | A fundação A0 está íntegra, vazia e fechada ao browser. | Responda `feito` e informe somente que as cinco verificações passaram. |
| A0 criou objetos, mas A0.1 não foi aplicada. | A estrutura existe, porém a policy explícita ainda não foi criada. | Aplique somente A0.1 e repita a seção 8. |
| Uma tabela existe antes de A0. | Pode haver tentativa anterior ou schema não reconhecido. | Pare; não solte `DROP`. É necessário inventário antes de decidir uma migration de compatibilidade. |
| RLS está `f`, há grants para `anon/authenticated` ou contagem maior que zero. | O ambiente não corresponde ao contrato A0. | Pare; não crie Super Admin, convite ou UI conectada. Informe o resultado sem dados pessoais. |
| A senha falha ou a conexão não abre. | Credencial ou rede precisa de ajuste. | Resolva no Supabase/local; não troque por `sb_publishable_...` nem publique segredo. |

## 10. O que não fazer nesta etapa

Não execute comandos para criar usuário, inserir e-mail, fazer `insert into platform_principals`, transformar um e-mail em admin, desativar RLS, criar policy permissiva, dar `GRANT` ao browser ou colocar service key no frontend. Nenhuma dessas ações pertence à instalação A0.

O projeto só seguirá para a implementação de comandos depois de uma migration separada de RPCs, testes permitir/negar, confirmação de MFA, proteção de idempotência e nova aprovação explícita.

## 11. Reversão e recuperação

Como a fundação A0 é um schema de segurança, **não execute `DROP ... CASCADE` por impulso**. Caso A0 tenha sido aplicada com sucesso, a reversão deve ser uma migration nova, revisada e aprovada que preserve evidências e dependências. Caso a aplicação falhe no meio, o modo `--single-transaction` deve reverter o arquivo corrente; confirme pela seção 5 antes de tentar novamente.

## 12. Encerramento seguro

Depois de concluir, feche o terminal ou remova as variáveis do shell atual:

```bash
unset PGHOST PGPORT PGDATABASE PGUSER PGSSLMODE
```

No PowerShell:

```powershell
Remove-Item Env:PGHOST, Env:PGPORT, Env:PGDATABASE, Env:PGUSER, Env:PGSSLMODE
```

Ao responder, envie apenas o status das verificações, por exemplo: `A0 e A0.1 aplicadas; 7 tabelas; RLS t em todas; 7 policies; zero linhas; zero grants diretos.` Não envie senha, URL de banco, secret key ou log que contenha credenciais.

## Referências

[1] [Supabase — conexão direta ao banco e uso de SSL](https://supabase.com/docs/guides/database/connecting-to-postgres)  
[2] [Supabase — Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)  
[3] [PostgreSQL — documentação do `psql`](https://www.postgresql.org/docs/current/app-psql.html)
