# Referência de Preço por Lote — A251

## Objetivo

A matriz física passa a explicar, no próprio cartão do Lote, onde aparecem o **preço por m²** e o **valor total referencial**. Os dois campos só recebem números quando o contexto protegido devolve uma política-base aprovada, sem exceção e vigente; o total usa exclusivamente a área física confirmada do mesmo Lote multiplicada pelo valor efetivo por m².

| Estado do contexto | Preço por m² | Valor total | Tratamento visual |
|---|---:|---:|---|
| Política preparada com exceção | Bloqueado | Bloqueado | Explica a pendência, sem revelar valor |
| Política preparada sem exceção | Bloqueado | Bloqueado | Informa validação pendente |
| Política encaminhada | Bloqueado | Bloqueado | Informa aprovação de segunda pessoa pendente |
| Política aprovada fora da vigência | Bloqueado | Bloqueado | Informa indisponibilidade por vigência |
| Política aprovada e vigente | Disponível | Calculado | Mostra referência por m², área confirmada e total |

## Revisão autenticada

A revisão do Vista do Sol confirmou a matriz com 14 Quadras e 164 Lotes físicos e a política-base em Preparação, com 163 linhas e uma exceção. Por isso, a tela apresenta a orientação dos campos de preço, mas não expõe preço por m² nem total para nenhum Lote. Nenhuma política foi aprovada, nenhum preço foi alterado e nenhuma venda, contrato ou financeiro foi criado.

| Verificação A251 | Resultado |
|---|---|
| Contexto protegido | A função v4 retorna área confirmada e total somente quando a política aprovada, sem exceção e vigente já autoriza a referência por m². |
| Política atual | A política do Vista do Sol permanece em Preparação, com exceção pendente; portanto preço por m² e total continuam bloqueados. |
| Revisão de interface | Desktop e móvel exibem a orientação de preço por m² e valor total no fluxo da matriz, sem revelar números da política preparada. |
| Validação integral | 219 arquivos de teste e 579 testes aprovados; tipagem, build Netlify e integridade de diff aprovados. |
| Exceção de build | Apenas o aviso não bloqueante de chunks grandes permaneceu. |
