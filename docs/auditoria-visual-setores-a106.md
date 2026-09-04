# Auditoria visual — setores reorganizados

**Modo:** leitura, sem seleção de organização, preenchimento, comando, criação, edição ou exclusão.

## Rotas verificadas

| Rota | Resultado observado |
| --- | --- |
| `/vendas-urbanas` | Exibe os setores 01 a 05 de Vendas Urbanas em ordem e os setores 06 Propostas, Reservas e Contratos e 07 Financeiro como bloqueados. |
| `/vendas-urbanas/agenda` | Exibe somente o setor 04 Agenda Interna como ativo, mantendo os demais setores como navegação contextual. Não oferece integração externa ou comunicação. |
| `/locacao` | Exibe os setores 01 a 05 de Locação em ordem e os setores 06 Contratos e Garantias e 07 Financeiro como bloqueados. |
| `/locacao/financeiro` | Exibe aviso explícito de setor bloqueado; não contém valores, percentuais, cálculos, contratos, garantias, parcelas, cobrança, pagamentos, repasses ou integrações externas. |

## Conclusão

As rotas verificadas mantêm a separação setorial, os estados vazios seguros e os limites econômico-operacionais. A sidebar global apresenta as colunas em ordem, sem transformar visibilidade em autorização. Não foi identificado defeito adicional de rota, navegação ou bloqueio nesta amostra visual.
