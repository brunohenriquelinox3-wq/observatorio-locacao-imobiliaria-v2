# Sócios e Parceiros — participações internas por loteamento

## Objetivo e fronteira operacional

Esta evolução transforma o vínculo de **Sócio, Parceiro ou Terrenista** em uma regra interna, versionada e auditável de participação no loteamento. Ela organiza a previsão de quem participa de cada lote, venda e item da agenda comercial. A regra é sempre consultada dentro da organização, do módulo, da finalidade, da vigência e da alçada autorizados.

O CRM **não se torna um arranjo de pagamento**. Ele não emite boleto bancário, não aceita recursos, não cria conta de pagamento, não instrui banco, não transmite remessa, não efetua split, não transfere valores, não envia mensagens de cobrança, não dá baixa e não confirma pagamentos. Arranjos de pagamento e transferências de recursos têm disciplina própria no Sistema de Pagamentos Brasileiro; o modelo deste CRM limita-se à projeção operacional interna e à revisão humana.[1] [2]

> **Regra de produto:** uma participação gera uma previsão interna vinculada ao item da agenda; ela jamais gera uma ordem de pagamento ou um recebimento confirmado.

## Entidades preservadas e novas camadas

| Camada | Finalidade | Estado de informação |
|---|---|---|
| Vínculo interno existente | Relaciona pessoa já cadastrada ao loteamento como sócio, parceiro ou terrenista | Mantido, temporal e sem alteração de dados anteriores |
| Conjunto de participação | Versão de regras aplicáveis a um loteamento, com vigência e política de composição | Rascunho, revisão ou ativa para novas vendas |
| Regra de participação | Define participante, método, base, componentes elegíveis, limite e escopo de lotes | Editável apenas enquanto a versão estiver em rascunho |
| Escopo de lote | Determina se a regra atinge todos os lotes do loteamento ou uma seleção explícita | Sem duplicar o estoque físico |
| Snapshot de venda | Congela a versão e as regras aplicáveis quando a venda é aprovada | Imutável e auditável |
| Projeção por agenda | Liga cada item interno da agenda à participação prevista correspondente | Não representa pagamento, repasse ou baixa |

## Configuração pelo operador

Ao selecionar um loteamento, o operador localiza a parte já cadastrada por documento fiscal declarado e escolhe o papel interno compatível. A tela apresenta os dados mínimos autorizados para conferência e não expõe documentos privados, chaves, contas bancárias ou arquivos.

Cada regra contém obrigatoriamente a vigência, o escopo, a base e o método de cálculo. Os métodos iniciais são: **percentual de cada componente elegível**, **valor fixo por componente** e **valor total por lote limitado por teto**. A base `resultado_final_referencial` poderá ser registrada como política de revisão, mas não cria previsão financeira até que exista, no futuro, uma fonte contábil humana e auditada para esse resultado.

| Campo de regra | Valores iniciais | Comportamento |
|---|---|---|
| Papel | Sócio, Parceiro ou Terrenista | Herdado do vínculo temporal autorizado |
| Escopo | Todos os lotes ou lotes selecionados | O escopo selecionado só vale para lotes do mesmo loteamento |
| Componentes elegíveis | Entrada, entrada parcelada, parcelas regulares, à vista, complemento ou crédito de bem | Cada componente é escolhido explicitamente; nenhum é presumido |
| Método | Percentual, fixo por componente ou total por lote | O método define como a projeção é calculada, não como dinheiro é pago |
| Limite | Teto total opcional por lote | Impede que uma regra supere o montante declarado sem revisão humana |
| Vigência | Início obrigatório e fim opcional | A regra precisa estar vigente na data da aprovação da venda |

## Composição, arredondamento e conflitos

Percentuais serão armazenados em pontos-base, preservando até quatro casas decimais percentuais. Para cada item da agenda, o sistema calcula a projeção em centavos e nunca distribui resíduos silenciosamente. Se percentuais, valores fixos, tetos ou escopos produzirem uma soma superior ao valor do item, a aprovação é bloqueada. Se a política da versão exigir alocação integral, qualquer saldo não alocado também bloqueia a aprovação; caso contrário, o saldo é identificado como parcela interna não participada, e não é atribuído automaticamente a ninguém.

Uma regra de `valor total por lote` percorre os componentes elegíveis por data e ordem estável, projetando somente até o teto declarado. O uso de crédito declarado de bem entregue permanece uma referência interna e requer revisão humana específica; não confirma entrega, transferência, avaliação ou recebimento do bem.

## Congelamento e sincronização entre setores

O congelamento ocorre na **aprovação comercial** da venda, na mesma transação que aprova o contrato interno, altera o estado comercial do lote e libera o lote interno de controle. Nessa operação, o sistema identifica somente regras ativas, vigentes, do mesmo loteamento e aplicáveis ao lote vendido. Em seguida, cria o snapshot imutável e as projeções por item de agenda. Uma alteração posterior na participação cria uma nova versão para vendas futuras e nunca reescreve contratos, agendas, lotes internos ou projeções já congeladas.

| Setor | Integração permitida | Não permitido |
|---|---|---|
| Loteamentos | Seleção de participantes, escopo total ou por lote, vigência e versão | Alterar matriz física, estoque ou disponibilidade por causa da regra |
| Central de Vendas | Consulta de alerta e congelamento na aprovação comercial | Alterar os percentuais manualmente durante a venda ou criar pagamento |
| Contrato e agenda | Snapshot e projeções por componente da agenda | Assinatura, cobrança, boleto bancário ou baixa |
| Financeiro interno | Resumos de valores projetados, saldo não alocado e revisão | Ordem de pagamento, split, remessa, banco, transferência ou confirmação automática |

## Alertas e auditoria

Os alertas são internos e apenas sinalizam: loteamento sem regra ativa, regra fora de vigência, participante sem vínculo autorizado, escopo incompatível, composição acima do permitido, saldo exigido não alocado ou alteração de regra após vendas aprovadas. Toda criação, edição, ativação, arquivamento lógico, congelamento e bloqueio grava evento de auditoria com contexto e correlação, sem expor valores individuais, documentos, dados bancários ou dados privados no log.

Não haverá exclusão física de vínculos, regras, snapshots ou projeções. Arquivamento ou supersessão mantém a trilha de revisão. Alterações em uma versão já utilizada por venda aprovada serão bloqueadas; uma nova versão deverá ser criada para efeito futuro.

## Critérios de aceite

1. A busca de parte por documento fiscal é contextual, auditada e não revela registros fora da organização autorizada.
2. Um participante somente pode receber regra no loteamento ao qual já esteja ligado por papel interno elegível.
3. Regras por lote não alcançam lotes de outro loteamento, e regras de loteamento não alcançam vendas externas ao seu escopo.
4. O snapshot produzido em venda aprovada é imutável, idempotente e reconciliado por componente da agenda.
5. A interface torna explícita a diferença entre **valor projetado** e **pagamento confirmado**.
6. Nenhuma mudança cria integração bancária, cobrança, emissão, mensagem, pagamento, repasse, baixa ou confirmação automática.

## Referências

[1]: https://www.bcb.gov.br/estabilidadefinanceira/arranjospagamento "Banco Central do Brasil — Arranjos de Pagamento"
[2]: https://www.bcb.gov.br/estabilidadefinanceira/exibenormativo?tipo=Resolu%C3%A7%C3%A3o%20BCB&numero=150 "Banco Central do Brasil — Resolução BCB nº 150"
