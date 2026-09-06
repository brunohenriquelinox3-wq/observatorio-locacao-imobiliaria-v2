# Contexto de preço por Lote — A240

## Finalidade

O contexto exibido ao focar um Lote passa a separar a ausência de referência vigente em estados operacionais compreensíveis. Nenhum desses estados revela preço, condição, referência de política ou documento ainda não aprovado.

| Estado interno | Orientação exibível | Efeito operacional |
|---|---|---|
| Sem política | Ainda não existe política formal preparada. | Nenhuma referência pode ser usada. |
| Preparada com exceção | A política tem pendência bloqueadora. | O operador deve tratar a pendência; não há preço por Lote. |
| Preparada sem exceção | A política aguarda validação. | Não há referência comercial. |
| Encaminhada | A política espera segunda aprovação. | Não há referência comercial. |
| Aprovada fora da vigência | A versão não vale para a data atual. | Não há referência comercial. |
| Ativa | A política foi aprovada, não tem exceção e está vigente. | A referência pode aparecer com a condição aprovada mais específica. |

> A política atual permanece em **Preparação com uma exceção**. Portanto, o CRM deve explicar o bloqueio, e não mostrar um preço que ainda não foi liberado.

## Revisão autenticada

A sessão autenticada confirmou a matriz física, a política preparada com 163 linhas agregadas e uma exceção, o formulário recolhido de correção manual e a central de condições sem registros. Não houve preço exibido nos Lotes, coerente com a ausência de política aprovada e vigente. A leitura de foco passa a depender da função v3 para explicar a indisponibilidade por categoria operacional, sem retornar referência de política ou valor enquanto a aprovação não existir.
