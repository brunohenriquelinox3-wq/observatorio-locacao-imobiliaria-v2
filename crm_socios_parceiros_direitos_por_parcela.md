# Direitos de Sócios e Parceiros por entrada, parcela e intermediária

**Status:** `requisito_estratégico_avançado`  
**Decisão do usuário:** todo sócio, parceiro ou modalidade que participe economicamente do loteamento pode receber valores originados da entrada, das parcelas regulares ou das parcelas intermediárias dos lotes. A regra pode ser percentual ou valor fixo, e cada negociação possui configuração contratual própria.

> **Princípio:** um parceiro não recebe porque pertence a uma categoria. Ele recebe quando um **direito contratual específico** encontra um **evento elegível** de uma negociação específica.

## 1. Estrutura de direito por negociação

| Entidade estratégica | Função |
| --- | --- |
| **Contrato de Participação** | Representa a negociação entre a loteadora e sócio/parceiro/fazendeiro/permutante/investidor ou outro participante. |
| **Plano de Direitos** | Agrupa as regras econômicas daquele contrato de participação. Um contrato pode ter vários planos ou versões ao longo do tempo. |
| **Regra de Direito** | Define recebedor, modalidade, escopo, base, valor/percentual, gatilho, prioridade, vigência e exceção. |
| **Evento de Parcela** | Entrada, parcela regular, parcela intermediária, reforço, amortização, acordo, juros/multa, desconto, reversão ou outro evento classificado. |
| **Projeção de Direito** | Quanto poderá caber ao participante se o evento futuro se realizar conforme as regras vigentes. |
| **Direito Elegível** | Quanto passa a ser exigível segundo contrato e prova de evento/condição. |
| **Instrução/Settlement/Conciliação** | Fatos separados de autorização, envio a parceiro, resultado externo e confirmação contábil/operacional. |

## 2. Modalidades de cálculo suportadas

| Modalidade | Exemplo de base | Configuração obrigatória | Não assumir |
| --- | --- | --- | --- |
| **Percentual da entrada** | Valor da entrada prevista ou recebida. | Percentual, conceito de entrada, evento gatilho, se calcula sobre valor bruto/líquido, arredondamento e vigência. | Que o parceiro recebe antes da condição contratual ou da confirmação definida. |
| **Valor fixo da entrada** | Uma ou mais entradas do contrato. | Valor, moeda, número máximo de ocorrências, condição e recebedor. | Que o valor se repete em toda parcela. |
| **Percentual da parcela regular** | Parcela mensal ou periodicidade definida. | Percentual, parcelas elegíveis, base, filtro de contrato/lote, prioridade e teto. | Que qualquer boleto emitido se tornou valor recebido. |
| **Valor fixo da parcela regular** | Cada parcela ou conjunto de parcelas definido. | Valor fixo, calendário, quantidade de ocorrências, condição de pagamento e exceção. | Que ocorre para parcela intermediária, acordo ou amortização se o contrato não disser. |
| **Percentual da intermediária** | Reforço/intermediária/balloon contratual. | Tipo de evento, percentual, base, carência, teto e regra de reversão. | Que intermediária tem a mesma regra da parcela mensal. |
| **Valor fixo da intermediária** | Evento de reforço definido no contrato. | Valor, sequência, data/condição e prioridade. | Que múltiplas intermediárias usam a mesma regra sem versão específica. |
| **Regra híbrida** | Entrada fixa + percentual de parcela + valor de intermediária. | Ordem das regras, acúmulo/exclusão, teto, vigência e memória de cálculo. | Que o sistema escolhe a regra mais vantajosa sem instrução contratual. |

## 3. Base do direito: projeção versus valor realizado

| Base declarada no contrato | O que o painel pode projetar | O que pode tornar o direito elegível |
| --- | --- | --- |
| **Agenda contratual prevista** | Projeção futura das entradas, parcelas e intermediárias conforme contrato ativo. | Condição definida: assinatura, vencimento, recebimento, entrega ou outra. |
| **Cobrança/instrução emitida** | Valor esperado de uma parcela cobrada. | Somente se o contrato afirmar que emissão torna o direito devido. |
| **Valor recebido com retorno** | Projeção/estado de recebimento pendente de conciliação. | Regra pode exigir retorno de banco/PSP, janela de segurança ou prova adicional. |
| **Valor conciliado** | Realizado confirmado na carteira. | Usado quando o contrato determina que a distribuição depende de caixa confirmado. |
| **Resultado apurado** | Projeção baseada em regras financeiras verificadas. | Exige apuração e aprovação societária/contábil aplicáveis. |

> A loteadora pode dar transparência ao parceiro sobre **projeção**, **valor esperado**, **valor recebido em análise** e **valor conciliado**. Esses estados nunca podem aparecer com o mesmo rótulo de “ganho disponível”.

## 4. Estado de cada direito

| Estado | Significado exibido ao parceiro | Próxima ação possível |
| --- | --- | --- |
| **Projetado** | Valor futuro calculado a partir da agenda contratual e da regra atual. | Aguardar evento, alteração contratual ou revisão de regra. |
| **Aguardando condição** | Parcela/evento existe, mas ainda não cumpriu o gatilho necessário. | Acompanhar vencimento, recebimento, documentação ou condição específica. |
| **Recebido em análise** | Há retorno/comprovante, porém a carteira ainda não concluiu a conciliação. | Conciliação, divergência ou correção. |
| **Elegível** | Regra e condição foram atendidas; o direito pode seguir para alçada/instrução. | Autorizar, suspender ou abrir exceção. |
| **Autorizado** | Alçada aprovou a instrução conforme o contrato e a política. | Instruir/liquidar por parceiro habilitado. |
| **Liquidado pendente de conciliação** | Há resultado externo, mas o subledger ainda precisa confirmar/correlacionar. | Conciliar ou tratar divergência. |
| **Conciliado** | Direito e efeito foram confirmados segundo a política aplicável. | Exibir como realizado. |
| **Bloqueado/em divergência** | Existe conflito de contrato, parcela, cálculo, documento, alçada ou evento externo. | Atribuir owner, evidência e próxima ação. |
| **Revertido/compensado** | Direito anterior foi ajustado por fato posterior autorizado. | Preservar memória do fato original e da compensação. |

## 5. Filtros de escopo da regra

| Filtro possível | Exemplos |
| --- | --- |
| Empreendimento/fase | Regra válida apenas em um empreendimento ou fase específica. |
| Quadra/lote | Regra vinculada a `Q12`, a `Q12 · L1` ou a conjunto de lotes definido. |
| Contrato/cliente | Regra válida para contrato ou cliente específico, quando o instrumento assim definir. |
| Tipo de parcela | Entrada, mensal, intermediária, reforço, acordo, amortização, juros/multa, desconto ou outro. |
| Origem do recebimento | Canal, imobiliária, corretor, campanha ou modalidade comercial, quando previsto. |
| Intervalo de vigência | Datas, quantidade de parcelas, marcos, teto de valor ou condição de encerramento. |

## 6. Invariantes obrigatórios

| Invariante | Resultado esperado |
| --- | --- |
| Cada regra possui contrato, recebedor, escopo, base e vigência. | Não existe direito “genérico” que alcance todas as parcelas por padrão. |
| Projeção e realizado são estados diferentes. | Parceiro vê expectativa futura sem confundir com valor já conciliado. |
| A mesma parcela não gera direito duplicado para a mesma regra. | Idempotência e chave de evento impedem duplicidade por retry, reprocessamento ou retorno repetido. |
| Várias regras podem coexistir somente se o contrato permitir. | Ordem, acúmulo, exclusão, teto e residual são explicitados. |
| Alteração de regra não altera memória passada. | Aditivo/versão modifica o futuro definido; cálculo histórico continua reproduzível. |
| Direito bloqueado continua visível com motivo apropriado. | Transparência não significa ocultar divergência nem liberar detalhe de terceiros. |

## Referências internas

[1] [Dossiê contratual e financeiro de Sócios e Parceiros](crm_socios_parceiros_dossie_contratual.md)

[2] [Subledger da imobiliária](crm_subledger_imobiliaria.md)

[3] [Loteadora, recebíveis e distribuição](crm_loteadora_recebiveis_distribuicao.md)
