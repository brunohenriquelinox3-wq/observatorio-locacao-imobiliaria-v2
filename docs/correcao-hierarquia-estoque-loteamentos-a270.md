# Correção de hierarquia visual: Estoque/Mapa dentro de Loteamentos — A270

## Achado confirmado

A navegação lateral apresentava **Loteamentos** e **Estoque/Mapa de Lotes** como itens irmãos numerados. Embora ambos já compartilhassem o grupo técnico de Loteamentos, essa composição fazia a área complementar parecer um setor independente.

## Decisão preservativa

O item visual independente de Estoque/Mapa foi removido da barra lateral. A rota compatível, sua página, seus controles de contexto, a matriz estrutural, os estados internos e os eventos permanecem existentes. O acesso agora é apresentado como uma área interna da jornada de Loteamentos, por meio da entrada unificada e do atalho de mapa interno presente no Cadastro/Matriz.

> Esta correção reorganiza a descoberta da funcionalidade; ela não remove dados, rotas, Cadastro, matriz física, ficha de Lote, estados/eventos internos nem qualquer controle de segurança.

## Evidência inicial de verificação

Na sessão autenticada, após a atualização, a barra lateral passou a listar Loteamentos uma única vez antes dos setores adjacentes. A entrada unificada continuou a oferecer os destinos Cadastro e Matriz e Estoque e Mapa. Nenhuma seleção, gravação, alteração de perfil, preço, disponibilidade, venda, contrato ou dado financeiro foi executada durante a inspeção.

A rota compatível de Estoque/Mapa também foi aberta diretamente e confirmou o reenquadramento como **Loteamentos · Área interna**, com título de mapa interno e retorno visível para Loteamentos. O retorno foi acionado como navegação segura e voltou à jornada unificada; nenhum contexto, formulário ou comando material foi utilizado.

## Validação e artefatos

Na primeira revisão posterior ao reenquadramento, foi identificado um seletor local que ainda derivava seus itens por posição global. Isso fez Segurança e MFA aparecer indevidamente entre os setores de Loteamentos. A regra foi substituída por uma seleção explícita das rotas da própria coluna, e a numeração dos setores subsequentes foi recomposta de 01 a 05. A inspeção autenticada confirmou o seletor local sem Segurança e MFA e sem Estoque/Mapa como setor paralelo.

Após essa correção, foram aprovados os testes focalizados de navegação e a suíte integral, totalizando 226 arquivos de teste e 614 testes. A tipagem, o build de publicação e a integridade do diff também passaram; o aviso conhecido de tamanho de alguns blocos do build permaneceu não bloqueante. A revisão visual percorreu a entrada unificada e a rota compatível em tela ampla, desktop, tablet e celular, sem clipping, sobreposição ou perda do retorno visível.

O ZIP de código-fonte e o HTML autônomo do marco foram gerados e passaram pela conferência de presença e saneamento. O pacote não contém ambiente, dependências, logs, build, documentação de trabalho ou checklist; o HTML não contém credenciais, hosts, endpoints ou marcadores de infraestrutura. Nenhuma publicação foi executada.
