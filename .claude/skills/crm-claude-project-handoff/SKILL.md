---
name: crm-claude-project-handoff
description: Empacotar e manter um CRM React/TypeScript com governança, mapa de arquitetura e skills específicas em uma estrutura portátil para Claude Code. Use quando o projeto precisar ser continuado no Claude, sincronizado com GitHub ou receber novas skills versionadas.
---

# Transferência do CRM para Claude Code

## Objetivo

Preparar uma cópia versionável e auditável do projeto para Claude Code, sem perder contratos, skills, runbooks, limites de segurança ou estado de gates.

## Ordem obrigatória

1. Ler `AGENTS.md`, `CLAUDE.md`, o mapa do projeto e o checklist atual.
2. Verificar `git status`, remotos, branch, arquivos sensíveis e histórico recente.
3. Selecionar somente skills relacionadas ao domínio; não copiar credenciais, sessões, artefatos ou skills externas sem necessidade.
4. Copiar cada skill com seu `SKILL.md`, `references/`, `scripts/` e `templates/` preservando a estrutura.
5. Criar ou atualizar `.claude/skills-index.md`, `docs/claude-project-map.md`, agentes especializados e `CLAUDE.md`.
6. Usar paths relativos no pacote; transformar referências absolutas do ambiente original em instruções condicionais ou caminhos do projeto.
7. Validar cada skill com `quick_validate.py`, além de tipagem, testes, builds e `git diff --check` do projeto.
8. Fazer scan de `.env`, tokens, chaves, PII, dumps, logs autenticados e URLs privadas.
9. Commitar de forma factual e fazer push apenas para o remoto GitHub existente, nunca para um novo repositório por suposição.
10. Registrar no mapa e no ledger quais skills foram incluídas, quais ficaram fora e quais gates continuam bloqueados.

## Estrutura recomendada

```text
CLAUDE.md
.claude/
  agents/
  skills/<nome>/SKILL.md
  skills/<nome>/references/
  scripts/
docs/claude-project-map.md
```

## Agentes mínimos

- `code-reviewer`: preservação, contratos e regressões.
- `security-reviewer`: secrets, autorização, RLS e limites Financeiros.
- `ui-reviewer`: rotas, acessibilidade, estados e reflow.

## Proibições

Não usar o handoff para publicar produção, executar mutations operacionais, consultar linhas Supabase, copiar dados de navegador ou mover segredos para o GitHub. Push de código não equivale a deploy nem a aprovação de runtime.
