# Auditoria visual — setores reorganizados

**Modo:** leitura, sem seleção de organização, preenchimento, comando, criação, edição ou exclusão.

## Rotas verificadas

| Rota | Resultado observado |
| --- | --- |
| `/vendas-urbanas` | Exibe os setores 01 a 05 de Vendas Urbanas em ordem e os setores 06 Propostas, Reservas e Contratos e 07 Financeiro como bloqueados. |
| `/vendas-urbanas/agenda` | Exibe somente o setor 04 Agenda Interna como ativo, mantendo os demais setores como navegação contextual. Não oferece integração externa ou comunicação. |
| `/locacao` | Exibe os setores 01 a 05 de Locação em ordem e os setores 06 Contratos e Garantias e 07 Financeiro como bloqueados. |
| `/locacao/financeiro` | Exibe aviso explícito de setor bloqueado; não contém valores, percentuais, cálculos, contratos, garantias, parcelas, cobrança, pagamentos, repasses ou integrações externas. |
| `/loteadora/financeiro` | Exibe aviso explícito de setor bloqueado e exige autorização posterior com revisão jurídica-contábil; não contém valores, percentuais, cálculos, parcelas, cobrança, pagamentos, repasses, contratos ou integrações externas. |
| `/loteadora` | A leitura integral do setor 01 confirma a separação entre cadastro de loteamentos e Estoque/Mapa de Lotes. A Quadra matriz está delimitada ao cadastro de loteamentos, os lotes seguem para o setor separado e, sem contexto ativo, listas e seletores permanecem vazios sem indicar existência de registros. |
| `/vendas-urbanas/imoveis-proprietarios` | Exibe somente o setor 02 Imóveis e Proprietários como ativo, com setores 01 a 05 contextualizados e 06 Propostas, Reservas e Contratos e 07 Financeiro bloqueados. Sem contexto, a tela não lista ou vincula referências; não exibe preço, endereço detalhado, documentos, disponibilidade, proposta, contrato ou dados financeiros. |
| `/locacao/imoveis-proprietarios` | Exibe somente o setor 02 Imóveis e Proprietários como ativo, com setores 01 a 05 contextualizados e 06 Contratos e Garantias e 07 Financeiro bloqueados. Sem contexto, a tela não lista ou vincula referências; não expõe disponibilidade, exclusividade, endereço detalhado, preço, mídia, matrícula, publicação, proposta, reserva, contrato, garantia, cobrança, repasse ou financeiro. |
| `/vendas-urbanas/perfil-busca` | Exibe somente o setor 05 Perfil de Busca como ativo, com setores 01 a 05 contextualizados e 06 Propostas, Reservas e Contratos e 07 Financeiro bloqueados. Sem contexto, não consulta nem registra perfil; a tela limita a estrutura a tipos canônicos, horizonte e código interno, sem endereço, preço, crédito, financiamento, dados pessoais ou decisão automática. |
| `/locacao/perfil-busca` | Exibe somente o setor 03 Perfil de Busca como ativo, com setores 01 a 05 contextualizados e 06 Contratos e Garantias e 07 Financeiro bloqueados. Sem contexto, não consulta nem registra perfil; a tela limita a estrutura a tipos canônicos, janela declarada e código interno, sem endereço, preço, renda, contato, documento, crédito, garantia, dados pessoais ou decisão automática. |
| `/locacao/agenda` | Exibe somente o setor 04 Agenda Interna como ativo, com setores 01 a 05 contextualizados e 06 Contratos e Garantias e 07 Financeiro bloqueados. Sem contexto, não consulta nem registra agenda; a tela não dispara contato, convite, mensagem, confirmação de visita, sincronização de calendário, contrato ou efeito financeiro. |

## Conclusão

As rotas verificadas mantêm a separação setorial, os estados vazios seguros e os limites econômico-operacionais. A sidebar global apresenta as colunas em ordem, sem transformar visibilidade em autorização. Não foi identificado defeito adicional de rota, navegação ou bloqueio nesta amostra visual.

Não havia organização ativa devolvida à prévia no momento da auditoria. Por isso, filtros e saídas dependentes de contexto não foram acionados; a limitação foi mantida em vez de contornar identity, membership, grant, vigência ou policy.
