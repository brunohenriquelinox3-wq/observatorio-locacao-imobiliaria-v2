# Mapa do projeto para Claude

**Projeto:** Observatório da Locação Imobiliária
**Stack:** React + TypeScript + Vite + Wouter + tRPC/Express + Supabase/PostgreSQL + Netlify Functions
**Fonte externa:** repositório GitHub privado configurado no remoto `github`

## Mapa de diretórios

| Área | Local | Responsabilidade |
|---|---|---|
| Frontend | `client/src/` | Rotas, páginas, componentes, shell e presenters |
| Rotas | `client/src/App.tsx` | Switch Wouter e destinos reais |
| Loteadora | `client/src/pages/SubdivisionFoundation.tsx` | Shell e jornadas de Loteamentos, Participantes, Clientes, Central e Financeiro |
| Componentes | `client/src/components/` | Shell, UI e componentes reutilizáveis |
| Contratos | `shared/` | Inputs, DTOs, tipos e presenters compartilhados |
| Server | `server/` | Adapters, routers, proteção contextual e testes |
| SQL | `supabase/migrations/` | Migrations versionadas; não editar migrations aplicadas |
| Netlify | `netlify/functions/` | Entry points serverless e pacote de teste |
| Governança | `docs/` | Manual, audit, planos, mapas, ledger e evidências saneadas |
| Claude | `.claude/` | Skills, agentes, scripts e índice portáveis |

## Cadeia por domínio

```text
Contexto/autenticação
  → Loteamento → Quadra → Lote
  → Participante/papel temporal → política versionada
  → Cliente → Central de Vendas → Jornada/Dossiê
  → agenda interna → item nominal → projeção/recebedor previsto
  → Financeiro nominal/read-only
```

## Arquivos de entrada prioritários

- `AGENTS.md` — preservação, autorização, versionamento e release.
- `todo.md` — ordem mestre e gates atuais.
- `docs/auditoria-manual-operador-loteadora-2026-09.md` — manual operacional.
- `docs/database-cartography/database-map.md` — cartografia sanitizada.
- `docs/database-cartography/database-change-ledger.md` — ledger de mudanças.
- `docs/esteira-master/mission-plan-2026-09-25.md` — plano de execução.
- `docs/esteira-master/fase-4-cenario-sintetico-gate-dossier-2026-09-26.md` — gate material atual.

## Comandos oficiais

```bash
pnpm check
pnpm test
pnpm build
pnpm build:netlify
git diff --check
python3 /home/ubuntu/skills/skill-creator/scripts/quick_validate.py <skill-name>
```

## Gates atuais

- O projeto pode ser analisado e corrigido localmente.
- O Financeiro permanece somente leitura nominal.
- O cenário sintético está autorizado somente no ambiente de teste e uma mutação por vez.
- Os vínculos temporais do Vista do Sol estão parciais; clientes, vendas, parcelas, documentos e Financeiro do cenário permanecem bloqueados.
- QA mobile autenticada pode estar limitada pela ausência de controle de viewport no conector; não inferir aprovação.

## Higiene de publicação

Não incluir no GitHub: `.env*`, segredos, tokens, credenciais, dumps, capturas autenticadas, dados individuais, URLs privadas, `dist/`, `.netlify/`, logs de sessão ou artefatos temporários. O GitHub é fonte de revisão; deploy de teste é separado e nunca deve ser inferido a partir de um push.
