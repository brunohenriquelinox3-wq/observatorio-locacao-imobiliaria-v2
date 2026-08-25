# Arquiteturas para boleto, Pix e distribuição a múltiplos recebedores

## Decisão de desenho

O CRM deve sempre calcular e versionar a cascata econômica; a decisão é **onde e quando** ocorre a liquidação. As alternativas abaixo são viáveis, mas exigem contratação, validação jurídica/fiscal, análise de capacidades do fornecedor e testes de retorno antes de uso em produção. Nenhuma delas deve ser ativada apenas porque o plano contém percentuais ou muitos recebedores.

| Abordagem | Como funciona | Trade-offs | Custo relativo | Complexidade de implantação |
| --- | --- | --- | --- | --- |
| Cobrança externa + instrução pós-conciliação | O cliente paga boleto/Pix da empresa; o CRM concilia e gera obrigações/instruções aprovadas para os recebedores. | Mais controle sobre condição, reserva e cascata; exige rotina de tesouraria e mais eventos de pagamento. | Menor no início; depende de tarifa bancária e operação. | Baixa a média. |
| Split nativo com um parceiro de pagamento | O parceiro emite cobrança e, se o produto contratado suportar, liquida a divisão configurada após as regras aprovadas. | Menos operação manual; depende de produto, KYC, limite de recebedores, regras de estorno e contrato do fornecedor. | Variável por transação e serviço. | Média. |
| Orquestração multi-parceiro | O CRM mantém uma camada de adaptação para cobrança/liquidação por mais de um fornecedor, escolhida por empresa, produto ou contingência. | Reduz dependência futura; aumenta governança, homologação, idempotência e custo de manutenção. | Maior de implantação; pode ganhar flexibilidade em escala. | Alta. |

> Não há escolha automática. A seleção deve ser feita após mapear volume, número de beneficiários por evento, municípios/empresas, necessidade de reserva, condição de pagamento, tratamento de distrato e capacidade contratual do parceiro de liquidação.

## Contrato de integração do CRM

| Capacidade | Requisito do CRM | Evidência antes de homologar |
| --- | --- | --- |
| Cobrança | Criar cobrança com contrato, parcela, devedor, vencimento, valor e chave de correlação | Documentação/API do produto, ambiente de teste, retorno e regra de idempotência. |
| Retorno | Receber criação, pagamento, falha, expiração, estorno e contestação | Assinatura/segurança do retorno, exemplos de payload, SLA e política de reprocessamento. |
| Recebedor | Vincular beneficiário à relação econômica aprovada, sem duplicá-lo | Exigências de cadastro/KYC, estado de habilitação, conta/destino e atualização. |
| Split | Enviar plano aprovado com base, regra, recebedor, valor e referência | Limite de itens, tipos de regra, ordem, arredondamento, timing e reversão suportados. |
| Pagamento pós-conciliação | Criar instrução apenas para entitlement elegível | Aprovação, limites, expiração, callback e retorno individual por recebedor. |
| Estorno/distrato | Bloquear/recalcular direitos e registrar ação compensatória | Semântica de estorno parcial, recuperação de repasse, disputa e referências retornadas. |
| Conciliação | Mapear IDs externos a contrato, parcela, entitlement e empresa | Export/extrato, deduplicação, data de liquidação e conciliação de tarifas. |

## Sequência segura para um split com até 100 recebedores

1. O contrato, a relação de cada recebedor e o plano de distribuição são revisados e aprovados.
2. O CRM calcula `DistributionEntitlement` por item, identifica bloqueios e fecha a versão da cascata para o evento elegível.
3. A cobrança é emitida por parceiro habilitado ou pela conta da empresa, com chave de correlação imutável.
4. O retorno de pagamento é validado e conciliado; um pagamento parcial não é tratado como pagamento integral.
5. Apenas os entitlements elegíveis, desbloqueados e aprovados podem virar instrução de split/repasse.
6. O parceiro retorna o estado individual de cada recebedor; falha de um item abre exceção, sem apagar os demais estados.
7. Estorno, distrato ou ajuste criam eventos compensatórios ligados aos itens originais; não editam o recebimento original.

## Checklist de homologação de um parceiro

| Dimensão | Pergunta de validação |
| --- | --- |
| Produto | Boleto, Pix, split, múltiplos destinatários e retornos necessários existem no contrato e na documentação atual? |
| Capacidade | Qual é o limite de recebedores, frequência de liquidação, regra de arredondamento e modelo de estorno? |
| Governança | Quem habilita recebedor, aprova instrução, revoga destino e recebe alertas de falha? |
| Operação | Como são tratadas duplicidade, reprocessamento, timeout, indisponibilidade e conciliação de tarifa? |
| Dados | Quais dados pessoais/empresariais são enviados, com qual finalidade, base e período de retenção? |
| Fiscal/contábil | Como cada repasse é referenciado no subledger, no documento e na exportação do contador? |
| Segurança | Como são autenticados callbacks, rotacionados segredos e auditadas permissões? |

## Fronteira de responsabilidade

O Banco Central define a instituição de pagamento como pessoa jurídica que viabiliza movimentação de recursos no âmbito de um arranjo de pagamento e enumera instrumentos, regras, conta de pagamento e participantes da cadeia. [1] Portanto, o CRM deve manter a regra, a evidência, a autorização e a conciliação; o parceiro contratado deve executar a transação conforme sua habilitação, contrato e regras aplicáveis.

## Referência

[1] [Banco Central do Brasil — O que é instituição de pagamento?](https://www.bcb.gov.br/pre/composicao/instpagamento.asp?frame=1)
