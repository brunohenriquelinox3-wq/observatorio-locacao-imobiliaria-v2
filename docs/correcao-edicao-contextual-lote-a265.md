# Correção de edição contextual por cartão de Lote — A265

## Problema confirmado

O botão **Editar** do cartão já transferia os atributos físicos do Lote para a ficha operacional, mas iniciava a rolagem no mesmo ciclo da atualização de estado. Isso deixava a navegação visual sujeita ao momento de renderização e não colocava o foco no seletor da unidade, podendo aparentar que o botão não direcionou ao Lote escolhido.

## Correção aplicada

A seleção contextual passou a usar uma única unidade canônica da matriz: o botão resolve a Quadra existente, localiza o mesmo Lote nas opções físicas disponíveis e preenche a ficha uma única vez antes de rolar e entregar foco ao seletor de Lote. A remoção da atualização concorrente elimina a condição que podia repor o placeholder após o clique. A troca manual no seletor continua preenchendo a ficha, sem reiniciar a rolagem.

O clique não chama mutação, não altera medidas, preço, política, condição, disponibilidade, venda, contrato ou financeiro. A ficha exibe a confirmação da unidade selecionada antes de qualquer comando de salvamento sujeito a MFA e demais controles.

## Evidência de validação

A validação dirigida aprovou os testes do componente, a tipagem e a integridade do diff. A jornada autenticada alcançou a matriz e a ficha física sem gravar alterações. Um teste de salvamento foi bloqueado corretamente por MFA/contexto, preservando a regra de que o atalho Editar não concede permissão nem grava dados.

O percurso manual alcançou o módulo Estrutura e a matriz detalhada no contexto autenticado, confirmando que a navegação até os cartões e a ficha permanece disponível após a correção. Nenhum botão de salvamento foi acionado.

## Reforço de consistência

A validação também identificou a necessidade de padronizar identificadores de Quadra no limite da matriz para texto, evitando comparações entre representações distintas de uma mesma opção controlada. O atalho agora resolve uma chave canônica, encontra o Lote correspondente na coleção física renderizada e prepara o rascunho diretamente, sem executar mutação de dados.

## Validação consolidada

O fluxo final preserva uma única escrita de seleção antes da rolagem, com foco no seletor de Lote já renderizado. A confirmação visível na ficha só é exibida depois de Quadra e Lote terem sido determinados. A validação integral aprovou 219 arquivos de teste e 597 testes, além de tipagem, build Netlify e integridade do diff. Nenhum comando de salvamento foi incluído no atalho nem acionado durante a verificação.

O pacote de entrega foi gerado somente após essa validação. O ZIP de código exclui arquivos de ambiente, dependências, logs, documentação de trabalho, checklist e diretórios de upload; o HTML autônomo não contém credenciais, URLs concretas ou variáveis de runtime sensíveis. O HTML é apenas visual e não substitui as proteções do servidor.
