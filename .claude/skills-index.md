# Índice de skills do projeto

As skills abaixo são cópias versionadas de conhecimento operacional já utilizado no CRM. Claude deve carregar somente a skill específica da tarefa, seguindo divulgação progressiva.

| Skill | Acionar quando |
|---|---|
| `crm-loteadora-evolution` | Evoluir preservativamente qualquer setor ou jornada da Loteadora |
| `crm-interface-language` | Corrigir nomenclatura, mensagens e linguagem operacional |
| `crm-database-cartography` | Mapear schema, migrations, funções, RLS e cadeia banco→UI |
| `subdivision-internal-participation-governance` | Trabalhar com participantes, papéis, políticas e projeções internas |
| `subdivision-synthetic-client-registry` | Cadastrar ou reconciliar clientes explicitamente sintéticos |
| `finance-internal-release-qa` | Publicar ou testar Financeiro nominal/read-only |
| `crm-route-architecture` | Criar ou ajustar rotas reais e deep links |
| `crm-sidebar-hierarchical-navigation` | Reordenar coluna, setor e subsetor |
| `subdivision-stock-map-architecture` | Trabalhar com Quadras, Lotes, mapa, grade ou estoque |
| `subdivision-client-loteadora-release-qa` | Auditar e publicar Clientes Loteadora |
| `billing-reference-inventory` | Estoque interno nominal de parcelas e referências externas |
| `payment-split-engineering` | Estudar split/ledger/reconciliação; nunca executar pagamento |
| `web-design-reviewer` | Revisar visualmente responsividade, acessibilidade e layout |
| `web-perf` | Auditar Core Web Vitals e recursos bloqueantes |
| `performance-optimization` | Otimizar performance após evidência de gargalo |
| `crm-study-to-skill-coverage` | Converter estudos preservados em cobertura de skills |
| `crm-claude-project-handoff` | Atualizar este pacote Claude, mapa, skills e governança de transferência |

## Skills fora deste pacote

Skills genéricas do ambiente Manus continuam disponíveis no ambiente original, mas não são copiadas automaticamente para este repositório. Esta separação evita empacotar credenciais, integrações ou conhecimento não relacionado ao CRM.

## Regra de manutenção

Ao alterar uma skill: preservar frontmatter `name`/`description`, manter `SKILL.md` abaixo de 500 linhas quando possível, mover detalhes para `references/`, executar `quick_validate.py`, atualizar este índice e registrar a mudança no ledger.

O workflow `.github/workflows/validate-project.yml` executa a validação do pacote Claude, instalação pelo lockfile, tipagem, testes e builds em push, pull request e duas janelas diárias. O script local `.claude/scripts/validate_package.py` não depende de credenciais ou serviços externos.
