# Auditoria final — coluna LOTEADORA

**Objetivo:** decidir a estrutura final da coluna LOTEADORA antes de qualquer implementação.  
**Como responder:** para cada linha, indique apenas **MANTER**, **SEPARAR**, **UNIR**, **RENOMEAR**, **REMOVER** ou **ADICIONAR**, seguido da sua observação.

> **Decisão aprovada:** `LOT-A01` foi aprovado pelo usuário. **Cadastro de Loteamentos** e **Estoque/Mapa de Lotes** serão dois setores distintos, ligados à mesma estrutura de gleba, empreendimento, fase, quadra e lote, sem cadastro duplicado.

## 1. Estrutura recomendada para decisão

| Ordem | Setor recomendado | Decisão recomendada | Por que existe | O que contém |
| --- | --- | --- | --- | --- |
| 0 | **Painel Loteadora** | **ADICIONAR/MANTER** como tela inicial da coluna. | Dá visão rápida da operação sem substituir o financeiro ou estoque. | Alertas de lote bloqueado, reservas a vencer, contratos pendentes, parcelas em atraso, carteira, recebíveis, repasses bloqueados e obra/marco pendente quando aplicável. |
| 1 | **Cadastro de Loteamentos** | **SEPARAR** do estoque operacional. | Cadastro é a estrutura do empreendimento; estoque é a operação diária dos lotes. | Glebas, empreendimentos, fases, quadras, parâmetros, evidências, registros, documentos, tabelas base e configuração de cada loteamento. |
| 2 | **Estoque e Mapa de Lotes** | **SEPARAR** do cadastro. | A equipe comercial precisa operar visualmente disponibilidade, mapa, reserva e situação de lote sem editar a estrutura do empreendimento. | Mapa/espelho, lotes, unidades, tabela vigente, disponibilidade, bloqueios, alocações, restrições, holds, reservas e situação comercial. |
| 3 | **Parceiros e Origem da Terra** | **RENOMEAR** o atual “Sócios e Parceiros”. | Fazendeiro/proprietário da terra, permutante, sócio, captador e parceiro não devem parecer o mesmo vínculo. | Sócios, parceiros, proprietários/fazendeiros da terra, permutantes, investidores, captadores, beneficiários, instrumentos, origem, vigência e condições. |
| 4 | **Clientes e Compradores** | **RENOMEAR** o atual “Clientes”. | Deixa claro que o setor serve tanto para interesse inicial quanto para compra contratada e coadquirentes. | Proponentes, compradores, coadquirentes, representantes, empresas compradoras, documentos e buscas autorizadas por CPF/CNPJ. |
| 5 | **Propostas, Reservas e Contratos** | **UNIR** em um setor comercial. | Essas etapas são uma jornada única; separar no primeiro momento pode criar cliques sem ganho. | Propostas, escolha de lote, reserva com prazo, aprovação, documentação, condições comerciais, contratos, aditivos, cessões, distratos e pós-venda comercial. |
| 6 | **Financeiro e Carteira** | **MANTER** como setor central e principal. | É o coração financeiro da loteadora e concentra o ciclo de parcelas, cobrança, recebíveis, pagáveis e carteira. | Boletos/instruções, parcelas, vencimentos, recebíveis, pagáveis, pagamentos, retorno, conciliação, atrasos, acordos, comprovantes, alertas e filtros. |
| 7 | **Repasses e Distribuição** | **SEPARAR** do Financeiro como setor próprio, porém conectado. | Loteadora pode ter muitos recebedores e regras por entrada, parcela, lote físico, VGV, fluxo ou resultado; isso merece leitura própria. | Comissões, corretor, imobiliária, captador, fazendeiro/proprietário da terra, permutante, parceiro, sócio, planos de distribuição, direitos, bloqueios e instruções. |
| 8 | **Obras e Infraestrutura** | **DECIDIR** se entra já ou como módulo posterior. | É relevante para loteadora, mas obra não pode atrasar a fundação comercial/financeira se não for prioridade do seu modelo. | Cronograma, marcos, pendências, responsáveis, evidências, infraestrutura e alertas vinculados ao empreendimento/fase. |
| 9 | **Relatórios da Loteadora** | **NÃO criar como setor principal agora.** | Relatórios devem aparecer dentro de cada setor e no Painel Loteadora/ADM, evitando um menu de relatórios vazio ou duplicado. | Atalhos contextuais para estoque, vendas, carteira, inadimplência, recebíveis, parceiros, repasses e desempenho por empreendimento. |

> **Convenção aprovada:** a **Quadra** é sempre a matriz de seus lotes. A identificação operacional usa `Qn · Ln`: por exemplo, `Q12 · L1` até `Q12 · L100`. Cadastro de Loteamentos cria a matriz; Estoque/Mapa de Lotes opera o mesmo lote sem duplicá-lo.

## 2. Financeiro e Carteira — estrutura interna recomendada

O **Financeiro e Carteira** permanece o setor mais importante da Loteadora. Ele deve ter abas ou telas internas, e não misturar tudo em uma tabela única.

| Área interna | Função | Filtros indispensáveis |
| --- | --- | --- |
| **Visão financeira** | Resumo de vencimento, recebido, atrasado, a vencer, acordado, bloqueado e conciliado. | Todos os empreendimentos, loteamento individual, fase, quadra, lote, período e entidade legal/SPE quando aplicável. |
| **Carteira e parcelas** | Consultar cada contrato, agenda de parcelas, saldo, juros, multa, desconto, aditivo, acordo e situação. | CPF/CNPJ, proponente principal, coadquirente, contrato, lote e empreendimento. |
| **Cobranças e boletos** | Gerar/registrar instruções, acompanhar vencimento, retorno, reemissão, cancelamento e comunicação de cobrança. | Cliente, parcela, data de vencimento, status de retorno e origem de cobrança. |
| **Conciliação e comprovantes** | Tratar retorno bancário/PSP, comprovante, divergência, aplicação de caixa e exceção. | Referência externa, valor, data, contrato, cliente e estado da divergência. |
| **Contas a pagar** | Compromissos de terra, obra, legalização, venda, fornecedor e parceiro, quando autorizados. | Empreendimento, centro de responsabilidade, fornecedor, categoria, vencimento e aprovação. |
| **Inadimplência e acordos** | Priorizar atrasos, régua de cobrança, promessa, acordo, distrato em análise e próxima ação. | Faixa de atraso, empreendimento, lote, cliente e responsável. |

> **Regra que deve permanecer:** boleto emitido não é parcela paga. O financeiro só confirma recebimento depois de retorno, aplicação de caixa e conciliação. Comprovante anexado é evidência recebida, não confirmação automática.

## 3. Repasses e Distribuição — por que recomendo setor próprio

| Tipo de recebedor | Exemplo de direito | O que precisa aparecer antes de qualquer instrução |
| --- | --- | --- |
| Corretor ou imobiliária | Comissão sobre entrada, contrato, parcela ou condição específica. | Base, percentual/fixo, gatilho, versão, calendário, limite e reversão. |
| Captador | Valor fixo ou percentual pela captação da terra/venda. | Instrumento, objeto, condição, alçada e prazo. |
| Fazendeiro/proprietário da terra | Permuta física, participação no fluxo, entrada, parcela ou resultado. | Origem da terra, lote/receita elegível, instrumento, vigência e natureza do direito. |
| Permutante | Lote físico, crédito ou participação econômica. | Alocação, condição de entrega, bloqueio e relação com estoque/carteira. |
| Sócio/investidor | Resultado ou regra societária aprovada. | Acordo, resultado verificado, prioridade, provisões e aprovação. |

> **Regra:** um percentual cadastrado não é pagamento. Primeiro existe o direito econômico; depois vem aprovação, instrução, retorno externo e conciliação.

## 4. Conexões obrigatórias entre os setores

| De | Para | O que deve acontecer |
| --- | --- | --- |
| Cadastro de Loteamentos | Estoque e Mapa de Lotes | Cria a estrutura de gleba, empreendimento, fase, quadra e lote para operação diária. |
| Estoque e Mapa de Lotes | Propostas, Reservas e Contratos | Só libera um lote que esteja elegível, sem bloqueio, alocação incompatível ou reserva concorrente. |
| Clientes e Compradores | Propostas, Reservas e Contratos | Permite cadastrar proponente principal, coadquirente ou empresa compradora no mesmo contrato. |
| Propostas, Reservas e Contratos | Financeiro e Carteira | Contrato finalizado cria agenda de parcelas, cobranças e carteira. |
| Financeiro e Carteira | Repasses e Distribuição | Evento conciliado e regra aprovada podem tornar direitos elegíveis; não há repasse por simples etiqueta percentual. |
| Parceiros e Origem da Terra | Estoque / Repasses | Relação com a terra pode bloquear/alocar lote e também criar direito econômico, mas esses efeitos permanecem separados. |
| Obras e Infraestrutura | Cadastro / Estoque | Marco técnico pode gerar alerta/restrição; não libera venda ou altera carteira sozinho. |

## 5. Decisões que preciso de você agora

| Código | Decisão | Minha recomendação | Sua resposta |
| --- | --- | --- | --- |
| LOT-A01 | Cadastro de Loteamentos e Estoque ficam juntos ou separados? | **Separar.** | **APROVADO: separados.** |
| LOT-A02 | Nome do setor de parceiros. | **Parceiros e Origem da Terra.** |  |
| LOT-A03 | Nome do setor de clientes. | **Clientes e Compradores.** |  |
| LOT-A04 | Reserva fica dentro de Vendas ou setor próprio? | **Dentro de Propostas, Reservas e Contratos.** |  |
| LOT-A05 | Repasses ficam dentro de Financeiro ou setor próprio? | **Setor próprio: Repasses e Distribuição.** |  |
| LOT-A06 | Obras e Infraestrutura entra já ou depois? | **Depois, como módulo posterior**, salvo se for prioridade imediata. |  |
| LOT-A07 | Relatórios ficam como setor próprio? | **Não; usar atalhos nos setores e visão no Painel/ADM.** |  |
| LOT-A08 | Painel Loteadora entra como primeira tela? | **Sim.** |  |

## 6. Estrutura final sugerida, se você aprovar todas as recomendações

1. Painel Loteadora  
2. Cadastro de Loteamentos  
3. Estoque e Mapa de Lotes  
4. Parceiros e Origem da Terra  
5. Clientes e Compradores  
6. Propostas, Reservas e Contratos  
7. Financeiro e Carteira  
8. Repasses e Distribuição  
9. Obras e Infraestrutura *(módulo posterior, se aprovado)*  

Essa estrutura permite **explorar os dados de forma mais intuitiva**, **entender melhor as tendências** e **salvar ou compartilhar facilmente**, mantendo estoque, contratos, financeiro e direitos econômicos com limites claros.

## Referências internas

[1] [Inventário dos setores e decisões pendentes](crm_loteadora_auditoria_final_inventario.md)

[2] [Loteadora, recebíveis e distribuição](crm_loteadora_recebiveis_distribuicao.md)

[3] [Arquitetura canônica de colunas e setores](crm_arquitetura_colunas_setores_canonica.md)
