# Reconciliação de metragem e referência interna — A264

## Objetivo

Conferir a fonte privada de controle contra a matriz física persistida antes de qualquer aplicação de preço-base interno. A conferência limita-se a **Quadra**, **Lote**, **área física** e **preço-base por m²**. Nenhum campo de cliente, corretor, venda, disponibilidade, contrato, cobrança ou financeiro integra este processo.

## Resultado da fonte

A fonte foi processada pelo mesmo conjunto de barreiras aplicado à política-base: estrutura única, ausência de macro e vínculo externo, bloqueio de cabeçalho pessoal, bloqueio de fórmulas nos campos autorizados e rejeição de colunas não permitidas. As fórmulas auxiliares existentes ficaram fora dos campos autorizados e não foram lidas como preço, área ou identificador.

| Verificação | Resultado agregado |
|---|---:|
| Linhas físicas da fonte | 164 |
| Linhas físicas na matriz do CRM | 164 |
| Áreas correspondentes | 164 |
| Itens somente na fonte | 0 |
| Itens somente no CRM | 0 |
| Divergências de área | 0 |
| Linhas com preço-base explícito e área confirmada | 163 |
| Linha sem preço-base explícito | 1 |

> **Conclusão de reconciliação:** todas as metragens físicas da fonte conferem com a matriz atual. A única ausência de preço-base permanece intencionalmente sem valor e não pode receber estimativa ou total calculado.

## Limites preservados

Os preços elegíveis continuam como referência interna em política preparada. A aplicação não cria disponibilidade, preço comercial, proposta, venda, contrato, cobrança, pagamento, repasse ou qualquer lançamento financeiro. A leitura e a alteração continuam condicionadas a identidade, organização, membership, grant, escopo, finalidade, MFA recente, correlação, idempotência e auditoria redigida.

## Verificação da política e da interface

A política já preparada foi comparada, linha a linha em processamento privado, com os preços-base explícitos da fonte autorizada. As referências existentes correspondem integralmente à fonte e à área física conciliada. Por isso, não houve reaplicação nem duplicação de registros: regravar os mesmos valores não aumentaria a integridade e criaria risco operacional desnecessário.

Após MFA recente, a leitura protegida foi conferida na matriz: os cartões mostram **Valor por m²** e **Valor total do Lote** na própria grade física. O total é derivado exclusivamente do preço-base interno reconciliado e da área física confirmada. A única exceção de preço-base permanece sem valor por m² e sem total, exatamente como na fonte.

| Validação final | Resultado |
|---|---|
| Fonte física × matriz do CRM | Correspondência integral de áreas |
| Fonte explícita × política preparada | Correspondência integral de linhas, áreas e preço-base |
| Exceção sem preço-base | Preservada vazia, sem estimativa e sem total |
| Leitura após MFA | Valores e totais internos exibidos no cartão, sem efeito comercial |
| Testes integrais | 219 arquivos e 597 testes aprovados |
| Tipagem, build e integridade | Aprovados; aviso conhecido de bundles grandes não bloqueante |
