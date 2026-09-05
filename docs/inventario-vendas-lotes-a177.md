# Inventário de Vendas de Lotes — A177

**Data:** 05 de setembro de 2026  
**Escopo:** leitura de código, contratos e consultas protegidas. Nenhum rascunho de venda, Lote, cliente, co-comprador ou anexo foi criado, visualizado ou alterado.

| Camada | Comportamento atual | Limite preservado |
|---|---|---|
| Rascunho de venda | Associa Lote em rascunho a cliente comprador em rascunho dentro do contexto. | Não reserva Lote, não fixa titularidade, proposta, preço, contrato ou efeito financeiro. |
| Cobertura de anexo | Devolve apenas três estados opacos: sem intenção, aguardando ciclo ou cobertura registrada. | Não devolve documento, nome, URL, chave, tipo, tamanho ou conteúdo. |
| Classificação de trabalho | Usa fases fechadas de revisão de vínculo, revisão de cobertura privada e revisão humana. | Não aprova pessoa, não executa análise de crédito e não avança o ciclo comercial. |
| Co-compradores | Vincula participantes internos ao rascunho, no mesmo contexto e sem percentuais. | Não define obrigação, titularidade, prioridade, preço ou divisão econômica. |
| Segurança | Leituras e comandos validam subject, contexto, módulo, finalidade e RPC protegida. | A seleção na interface não concede alçada; toda mutação exige submissão explícita e correlação. |

## Lacuna para a próxima melhoria

Os estados já existentes estão distribuídos em cartões de rascunho. A próxima melhoria deve sintetizar, somente em leitura, a **preparação interna de cada rascunho**: vínculo Lote–cliente, cobertura privada opaca, participantes internos e classificação de trabalho. O resultado deve orientar a próxima revisão humana sem estabelecer reserva, proposta, contrato, preço, cobrança ou financeiro.
