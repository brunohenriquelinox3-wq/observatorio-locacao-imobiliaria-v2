# Lista lateral compacta de rascunhos — A211

## Problema corrigido

Os cartões de rascunho herdavam o crescimento vertical da coluna de trabalho e preenchiam o restante da tela, mesmo quando continham somente nome, referência e fase. Isso criava áreas vazias, escondia a finalidade dos itens e dificultava a comparação entre rascunhos.

## Composição aplicada

Cada item lateral agora possui altura compacta, alinhamento no início da lista e quatro informações de leitura autorizada: nome de trabalho, referência interna, fase de trabalho e ação “Abrir cadastro”. O item selecionado tem borda e fundo diferenciados. Nenhuma métrica comercial, preço, venda, documento, pessoa ou dado de outro contexto foi incluído.

| Estado | Comportamento |
|---|---|
| Lista com rascunhos | Itens compactos, com propósito legível e seleção destacada. |
| Busca sem resultado | Mantém mensagem de vazio contextual. |
| Contexto indisponível | Não exibe registros nem cria acesso. |
| Móvel | Mantém lista horizontal rolável com cartões mais largos, sem altura excessiva. |

## Limites preservados

A lista continua sendo somente uma superfície de leitura e escolha local. A seleção não concede alçada; o servidor continua validando identidade, MFA recente, organização, membership, grant, vigência, módulo, finalidade e policy antes de qualquer ação.

## Revisão visual

Na sessão autenticada, a lista passou a apresentar cartões compactos em sequência, com nome, referência, fase e indicação de abertura. A revisão em viewport de desktop confirmou que o cartão selecionado se diferencia por borda e fundo, sem ocupar a altura livre da coluna. No breakpoint móvel, a composição preserva o contexto em uma coluna e mantém a lista preparada para rolagem horizontal, sem corte ou estiramento vertical.

## Validação técnica

O teste dirigido cobre o alinhamento compacto e os rótulos de finalidade dos cartões. A validação integral aprovou **211 arquivos de teste e 509 testes**, além da tipagem, build compatível com Netlify e integridade do diff. O build apresentou somente o aviso não bloqueante sobre tamanho de chunk.
