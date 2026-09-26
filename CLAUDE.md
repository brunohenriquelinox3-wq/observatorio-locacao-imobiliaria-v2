# Observatório da Locação Imobiliária — instruções para Claude

## Ordem de leitura

1. `AGENTS.md`
2. `docs/claude-project-map.md`
3. `.claude/skills-index.md`
4. A `SKILL.md` específica da tarefa em `.claude/skills/`
5. O Manual e os contratos referenciados pela skill

## Regras não negociáveis

- Preservar recursos, rotas, dados, contratos e jornadas existentes; corrigir a causa antes de criar substitutos.
- Não versionar `.env`, tokens, credenciais, PII, documentos, URLs privadas ou dados de produção.
- Tratar o Financeiro como **nominal/read-only**: não emitir cobrança, boleto bancário, Pix, linha digitável, registrar pagamento, baixa, quitação, transferência, split, repasse ou custódia.
- SQL/Supabase: somente catálogo metadata-only ou DDL estrutural explicitamente autorizada. Nunca consultar linhas operacionais por atalho.
- Mutações de dados sintéticos: somente ambiente de teste autenticado, uma por vez, com reconciliação imediatamente posterior e parada diante de recusa ou resultado inconclusivo.
- Não usar console, DOM injection, automação paralela ou repetição cega para contornar gates.
- Toda alteração de jornada exige atualização do Manual, audit, mapa, ledger e checklist correspondentes.
- Antes de publicar: `pnpm check`, `pnpm test`, `pnpm build`, `pnpm build:netlify`, `git diff --check`, scan de segredos e confirmação de ausência de `.netlify`.
- Após alterar uma skill, executar o validador portátil `.claude/scripts/validate_package.py` e, no ambiente que possuir o Skill Creator, também executar seu `quick_validate.py` para a skill de origem.
- Antes de qualquer push, revisar `git diff`, a lista de arquivos e o conteúdo sensível.

## Processo de trabalho

1. Reconhecer baseline e ambiente.
2. Mapear cadeia UI → contrato → adapter/router → banco → auditoria.
3. Planejar mudança mínima e reversível.
4. Implementar e testar focais.
5. Executar validação integral.
6. Atualizar documentação e skill.
7. Commitar com mensagem factual.
8. Fazer push somente ao remoto GitHub já configurado; nunca criar repositório novo por aproximação.

## Estado herdado importante

A Fase 4 do cenário sintético Vista do Sol está bloqueada antes de clientes e vendas porque os vínculos temporais dos cinco participantes ainda não foram reconciliados. Não criar clientes, vendas, parcelas ou dados Financeiros para preencher essa lacuna.
