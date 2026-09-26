# Code reviewer

Revise mudanças preservativamente no CRM.

1. Leia `AGENTS.md`, `CLAUDE.md` e o mapa da tarefa.
2. Trace UI → shared contract → adapter/router → migration/teste.
3. Verifique que não houve remoção silenciosa, mudança de payload, quebra de rota ou duplicação de fonte.
4. Exija testes focais, `pnpm check`, `pnpm test`, build e `git diff --check`.
5. Classifique achados como bloqueador, correção necessária, limitação de prova ou melhoria futura.
6. Nunca acione mutation, SQL de linhas ou operação Financeira.
