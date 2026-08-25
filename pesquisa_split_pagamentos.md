# Pesquisa de cobrança, Pix, boleto e split

## Base regulatória e fronteira de arquitetura

O Banco Central define instituição de pagamento como pessoa jurídica que viabiliza serviços de compra e venda e de movimentação de recursos no âmbito de um arranjo de pagamento. A página oficial informa que uma transação depende de instituição de pagamento ou financeira aderente ao arranjo, instrumento de pagamento — como boleto —, instituidor/regras do arranjo e conta de pagamento como registro individualizado das transações. [1]

Isso determina uma fronteira importante para o futuro CRM: ele pode ser o **orquestrador de direitos econômicos, instruções, aprovações e conciliações**, mas não deve se apresentar como instituição de pagamento, manter saldo de terceiros ou executar repasses por conta própria. A cobrança e a liquidação devem passar por banco, instituição financeira ou instituição de pagamento habilitada, cujo contrato, capacidades e retorno técnico sejam avaliados antes de qualquer integração.

| Elemento | Papel do CRM | Papel do parceiro de pagamento |
| --- | --- | --- |
| Boleto/Pix | Definir cobrança, vencimento, contrato e referência de reconciliação | Emitir/cobrar conforme produto contratado, receber e devolver evento de status/liquidação. |
| Split | Calcular plano e entitlements aprovados; bloquear pendências; registrar instrução e retorno | Executar a divisão se suportada no produto/contrato e cumprir regras do arranjo, KYC e liquidação. |
| Contas de recebedores | Guardar referência autorizada/estado e vínculo do beneficiário | Validar/gerir conta de pagamento ou destino conforme sua política e regulação. |
| Saldo/caixa | Representar posição operacional conciliada e previsão | Manter registro/transação de conta de pagamento quando aplicável. |
| Estorno/disputa | Abrir caso, preservar origem e recalcular entitlement por regra | Processar o evento financeiro conforme mecanismo contratado e devolver status. |

## Controles pré-integração

| Controle | Decisão necessária antes de ativar |
| --- | --- |
| Habilitação | Confirmar a instituição e o produto a serem contratados, inclusive se são aptos a boleto, Pix, múltiplos recebedores e callbacks necessários. |
| Limites do produto | Verificar máximo de recebedores, timing de liquidação, regras de KYC, contas habilitadas, cancelamento, reembolso e estorno. |
| Modelo de caixa | Definir se a operação precisa apenas de instruções pós-conciliação ou de divisão nativa por pagamento; a decisão altera contrato, risco e integração. |
| Regras econômicas | Aprovar plano, recebedores, bases, gatilhos, bloqueios e arredondamento antes de qualquer chamada ao provedor. |
| Conciliação | Garantir IDs idempotentes, correlação de cobrança/pagamento/recebedor, retorno assinado e tratamento de falha/duplicidade. |
| Privacidade e segurança | Mapear dados transmitidos, finalidade, acesso, retenção e papel do parceiro no tratamento de dados. |

## Referência

[1] [Banco Central do Brasil — O que é instituição de pagamento?](https://www.bcb.gov.br/pre/composicao/instpagamento.asp?frame=1)
