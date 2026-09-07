# Modalidades de negociação — controle interno

## Escopo

Esta extensão registra a composição comercial acordada em uma venda de lote. Ela serve exclusivamente ao **controle interno** de contrato, agenda, lote interno de parcelas e lembretes ao operador. Não gera boleto bancário, linha digitável, remessa, mensagem, integração bancária, baixa, pagamento, transferência de propriedade ou avaliação automática de bem entregue.

## Componentes monetários

| Componente | Representação interna | Agenda | Regra principal |
|---|---|---|---|
| Venda à vista | pagamento único declarado | Um item na data acordada | Deve compor o total sem outros componentes monetários conflitantes. |
| Entrada à vista | entrada única | Um item de entrada | Mantida como modalidade já existente. |
| Entrada parcelada | quantidade, valor igual, primeira data e dia | Itens mensais de entrada | Pode coexistir com as parcelas regulares. |
| Parcelas regulares | quantidade, valor igual, primeira data e dia | Itens mensais regulares | Continua usando calendário mensal com ajuste de meses menores. |
| Complemento de valor | valor e data declarados | Um item de complemento | Permite registrar pagamento adicional acordado. |
| Bem entregue | categoria e valor de crédito declarados | Um item de crédito interno na data declarada | Não é avaliação, transferência, registro ou pagamento. |

## Integridade

> O total negociado deve ser exatamente igual à soma dos componentes monetários declarados. Valores residuais, componentes sem data, calendários incompletos ou composição acima do total são rejeitados no servidor.

Cada cronograma usa números próprios por modalidade. Isso evita colisões entre entrada parcelada e parcelas regulares simultâneas. O lote interno replica a agenda por `schedule_id` e recebe uma sequência visual determinística, preservando cada item sem inferir quitação.

## Sincronização

Depois da formalização, a agenda materializa todos os componentes. Após a aprovação humana do dossiê, o mesmo conjunto é replicado no lote interno. O estoque comercial do lote continua a ser marcado como vendido apenas na aprovação explícita. Clientes e proponentes permanecem vinculados ao caso, e o estoque de contratos mostra uma única preparação por venda.

## Bem entregue

O bem entregue é uma descrição declarada para conferência interna. O CRM registra apenas categoria, referência privada opcional e crédito negociado. A equipe responsável deve revisar documentação, posse, titularidade e qualquer avaliação fora desta camada; o sistema não infere nem confirma esses fatos.
