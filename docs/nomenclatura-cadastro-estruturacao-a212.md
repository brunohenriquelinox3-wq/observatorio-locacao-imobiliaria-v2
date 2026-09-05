# Nomenclatura operacional do Cadastro de Loteamentos — A212

## Decisão aplicada

O termo **rascunho** foi removido da experiência visível do Cadastro de Loteamentos. A interface passa a usar **Cadastro em estruturação** para o registro ainda em preparação, **Cadastro selecionado** para o item aberto e **Matriz física do cadastro** para a composição de Quadras e Lotes.

| Antes | Depois | Finalidade |
|---|---|---|
| Rascunhos | Cadastros · Loteamentos em estruturação | Lista lateral de trabalho. |
| Novo rascunho | Novo cadastro | Cabeçalho de criação. |
| Rascunho selecionado | Cadastro selecionado | Cabeçalho de edição. |
| Matriz física do rascunho | Matriz física do cadastro | Quadro de estrutura física. |
| Arquivar rascunho | Arquivar cadastro | Ação de ciclo, ainda bloqueada por Quadras ativas. |

As chaves técnicas, procedures e regras de persistência não foram renomeadas, pois são contratos internos de segurança e a mudança de nomenclatura é estritamente de experiência de uso. A linguagem nova não declara aprovação, regularidade, estoque comercial, disponibilidade, venda ou contrato.

## Verificação

Os testes dirigidos de estúdio e lista lateral foram aprovados após a troca, assim como a validação integral de 211 arquivos de teste e 509 testes, tipagem, build compatível com Netlify e integridade do diff. O build manteve somente o aviso não bloqueante de tamanho de chunk. Nenhum cadastro, matriz, Quadra, Lote, documento, preço, venda, contrato, financeiro ou alçada foi modificado.
