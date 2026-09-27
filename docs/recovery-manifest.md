# Manifesto de recuperação do projeto

**Data:** 2026-09-27  
**Branch de origem:** `main`  
**Objetivo:** registrar o máximo de código recuperado da tarefa anterior sem publicar módulos com dependências ausentes.

## Lote validado para publicação

O lote recuperado foi reconstruído a partir dos artefatos preservados da tarefa anterior. Os destinos foram inferidos pela estrutura atual do projeto e validados com TypeScript.

| Área | Conteúdo |
|---|---|
| `shared/` | contrato de erros de papéis internos |
| `server/` | presenters, helpers, testes focais e testes de migração |
| `client/src/lib/` | disponibilidade de lote residencial e testes |
| `client/src/components/` | CSS recuperado do diretório arquivado |
| `supabase/migrations/` | migrações A383–A393 recuperadas |
| `scripts/` | gates A379, A380, A383 e esteiras de auditoria/pesquisa |

## Validações executadas

- `pnpm install --frozen-lockfile`
- `pnpm check` — aprovado após separar dependências não recuperadas
- `pnpm vitest run` nos testes focais e de migração — **102 arquivos / 254 testes aprovados**
- `bash -n scripts/*.sh` — aprovado
- `git diff --check` — deve ser executado antes do commit final

## Arquivos deliberadamente bloqueados

Os arquivos abaixo **não devem ser publicados isoladamente**, pois dependem de contratos, routers ou componentes que ainda não foram recuperados:

- `SubdivisionDevelopmentArchivedDirectory.tsx`
- `SubdivisionDevelopmentArchivedDirectory.test.ts`
- `SubdivisionInternalPartyArchivedDirectory.tsx`
- `crmNavigationHelpers.ts`
- `crmNavigationHelpers.test.ts`
- `subdivisionArchivedDevelopmentRestore.ts`
- `subdivisionArchivedDevelopmentRestore.test.ts`

Esses módulos devem ser reintroduzidos somente depois de recuperar, respectivamente:

- o router `subdivisionFoundation` com `listArchivedDevelopments` e `restoreArchivedDevelopment`;
- `SubdivisionInternalPartyDirectory`;
- o tipo completo de `DashboardNavigationItem`;
- os contratos `restoreSubdivisionArchivedDevelopmentInputSchema` e `RestoreSubdivisionArchivedDevelopmentInput`.

## Regras para continuar

1. Não executar migrations diretamente em produção.
2. Não editar migrations já aplicadas; criar uma migration posterior para correções.
3. Recuperar os módulos bloqueados somente junto com suas dependências.
4. Validar cada lote com `pnpm check`, testes focais e `git diff --check`.
5. Manter o Financeiro nominal/read-only.
6. Não criar dados reais ou contornar gates de autenticação e autorização.
7. Publicar cada grupo em commit separado e factual.

## Estado

Este manifesto descreve o lote recuperado e suas limitações. Ele não representa aprovação de deploy nem execução das migrations. O próximo agente deve atualizar esta tabela com os hashes dos commits publicados e os resultados de validação remota.
