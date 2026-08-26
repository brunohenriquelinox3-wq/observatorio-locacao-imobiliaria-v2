# Dossiê contratual e financeiro — Sócios e Parceiros

**Status:** `modelo_de_cadastro_aprovado_para_estratégia`  
**Princípio:** cada contrato é um contrato; cada negociação é uma negociação. O cadastro não usa um único percentual, campo de observação ou perfil genérico para representar relações diferentes.

## 1. Estrutura de um vínculo individual

Cada cadastro de Sócio ou Parceiro pode possuir um ou mais **Vínculos de Participação**. Um vínculo corresponde a uma negociação específica e não deve ser compartilhado implicitamente por outro empreendimento, contrato, lote, fase ou período.

| Bloco | O que deve ser registrado |
| --- | --- |
| **Identificação do vínculo** | Código interno, título da negociação, modalidade, status, data de início, data de término/condição e responsável interno. |
| **Partes envolvidas** | Parte principal, representantes, coproprietários, cedentes, cessionários, intervenientes, beneficiários, grupo de participação quando houver e respectivos papéis. |
| **Objeto da negociação** | Empresa/SPE, gleba, empreendimento, fase, quadra, lote, unidade, contrato de venda, recebível, obra, serviço, canal ou evento econômico aplicável. |
| **Origem e justificativa** | Como nasceu a relação: aquisição, aporte, permuta, captação, venda, obra, desenvolvimento, corretagem, cessão, garantia, sociedade ou outro motivo documentado. |
| **Instrumento/contrato** | Tipo, número/referência, versão, data de assinatura/eficácia, anexos, assinaturas, revisão, owner jurídico e condição suspensiva quando houver. |
| **Condições comerciais** | Valor, percentual, índice, prazo, carência, correção, teto, prioridade, gatilho, condição de pagamento, condição de entrega e exceções. |
| **Direito econômico** | Natureza, base de cálculo, recebedor, periodicidade, calendário, elegibilidade, retenção, suspensão, reversão, cessão e memória de cálculo. |
| **Alocação física** | Lote/unidade/fração quando houver permuta física, bloqueio de estoque, condição de entrega, substituição, distrato e liberação. |
| **Aprovação** | Proposta, alçada, aprovador, justificativa, decisão, validade e data de revisão. |
| **Histórico e auditoria** | Criação, alteração, aditivo, cessão, suspensão, pagamento/instrução, divergência, distrato, encerramento e links para evidências. |

## 2. Modalidades financeiras e físicas que não podem ser confundidas

| Modalidade | Base possível | O que o sistema deve guardar | O que não deve assumir |
| --- | --- | --- | --- |
| **Valor fixo** | Valor contratado, entrada, parcela, marco ou evento. | Moeda, valor, evento gatilho, calendário, atualização, limite e recebedor. | Que o valor se repete em todas as parcelas ou que está pago após emissão de boleto. |
| **Percentual de VGV** | VGV definido no instrumento. | Conceito de VGV, itens elegíveis, versão, exclusões, teto e regra de revisão. | Que percentual de VGV é percentual de caixa recebido ou de lucro. |
| **Percentual de fluxo** | Parcelas/recebimentos elegíveis. | Evento de elegibilidade, retorno/conciliação, retenções, ordem, limite e cálculo por parcela. | Que cobrança emitida ou comprovante anexado é fluxo líquido confirmado. |
| **Participação no resultado** | Resultado verificado conforme acordo. | Método de apuração, períodos, custos/provisões, prioridade, governança e aprovação. | Que faturamento, entrada ou caixa equivale a resultado distribuível. |
| **Permuta física** | Lote/unidade/fração definida. | Alocação, `Qn · Ln`, condição de entrega, valor de referência quando necessário, bloqueio e substituição. | Que lote físico vira um pagamento em dinheiro sem regra própria. |
| **Comissão comercial** | Venda, entrada, parcela, contrato, recebimento ou outro gatilho contratual. | Regra, gatilho, percentual/fixo, corretor/imobiliária/captador, clawback e calendário. | Que venda proposta ou percentual cadastrado já autoriza liquidação. |
| **Aporte/crédito/garantia** | Aporte, contrato de crédito ou garantia. | Principal, retorno, prazo, prioridade, garantia, vencimento, cobrança e risco. | Que investidor/credor é automaticamente sócio ou beneficiário de estoque. |

## 3. Estados do vínculo de participação

| Estado | Significado | Próxima transição permitida |
| --- | --- | --- |
| **Rascunho** | Negociação em estruturação; ainda sem eficácia. | Pendência documental, revisão ou cancelamento. |
| **Em revisão** | Contrato, parte, objeto ou condição está sendo conferido. | Aprovado, devolvido para ajuste ou rejeitado. |
| **Aguardando condição** | Documento foi aceito, mas depende de condição suspensiva, registro, aporte, evento ou alçada. | Ativo, suspenso, encerrado ou exceção. |
| **Ativo** | Vínculo eficaz dentro de seu escopo e vigência. | Aditado, suspenso, cedido, disputado ou encerrado. |
| **Suspenso** | Direito/vínculo temporariamente bloqueado por condição, divergência, inadimplência, litígio ou decisão. | Reativado, ajustado, cedido ou encerrado. |
| **Aditado** | Novo instrumento/versão ajusta condições futuras. | Ativo pela nova versão; passado permanece preservado. |
| **Cedido** | Direito ou posição transferida para outra parte. | Encerrado para cedente e ativo para cessionário conforme eficácia. |
| **Em divergência** | Existe conflito de documento, cálculo, parte, objeto, pagamento ou alocação. | Resolvido com decisão, ajuste/compensação ou encerramento. |
| **Encerrado** | Vínculo terminou por cumprimento, distrato, prazo, rescisão ou decisão. | Sem alteração retroativa; novo fato só por caso/documento posterior. |

## 4. Dossiê de documentos e evidências

| Tipo de evidência | Finalidade |
| --- | --- |
| Documento da parte | Identificar PF/PJ, representação, poderes, contatos e dados autorizados. |
| Documento da terra/ativo | Ligar o vínculo a gleba, lote, quadra, matrícula, referência ou alocação física. |
| Contrato/instrumento | Comprovar a negociação, partes, objeto, condições, vigência e assinaturas. |
| Aditivo/cessão | Atualizar condições futuras ou transferir posição sem apagar a história. |
| Memória de cálculo | Demonstrar base, regra, período, prioridade, arredondamento, bloqueio e resultado do direito. |
| Aprovação/alçada | Mostrar quem aprovou, por qual motivo, em qual escopo e por quanto tempo. |
| Comprovante/retorno externo | Registrar evidência recebida de cobrança, pagamento, banco ou parceiro, sem confundir com conciliação final. |
| Parecer/revisão especializada | Registrar análise jurídica, contábil, fiscal, registral ou técnica quando o caso exigir. |

## 5. Campos financeiros obrigatórios quando houver direito econômico

| Campo | Pergunta respondida |
| --- | --- |
| Natureza do direito | É comissão, permuta, repasse de terceiro, distribuição de resultado, crédito, taxa ou outro? |
| Base de cálculo | O percentual/valor incide sobre VGV, fluxo, parcela, entrada, resultado, lote físico, valor contratado ou outra base? |
| Evento gatilho | O direito nasce na assinatura, aprovação, recebimento conciliado, entrega, marco de obra, resultado apurado ou outro evento? |
| Prioridade | Existe ordem de pagamento/distribuição, reserva, teto, catch-up ou bloqueio anterior? |
| Calendário | É único, mensal, por parcela, por marco, por competência, por lote ou por evento? |
| Estado de elegibilidade | Está pendente, provisionado, autorizado, instruído, suspenso, pago, conciliado ou em divergência? |
| Regra de exceção | Como tratar distrato, inadimplência, reversão, cessão, morte/sucessão, substituição de lote ou mudança de contrato? |

## 6. Extensões obrigatórias do dossiê

| Extensão | Registro necessário | Limite obrigatório |
| --- | --- | --- |
| Direito por parcela | Tipo de evento — entrada, regular, intermediária ou outro —, percentual/fixo/híbrido, base, fórmula, vigência, teto, condição e memória. | Projeção, elegibilidade, instrução, retorno e conciliação não se confundem. |
| Grupo de Participação | Membros, objetos unificados, regra econômica, regra de visualização, instrumento e vigência. | Parentesco ou vínculo societário não cria grupo nem compartilha dados por padrão. |
| Painel de parceiro | Finalidade, campos liberados, contratos/lotes/clientes elegíveis, estado do grant e trilha de acesso. | Painel é leitura/solicitação; não confere poderes de carteira, contrato, lote, regra ou administração. |
| Operação de Capital | Natureza declarada com owner especializado, compromisso total, marcos, condições, evidências, eventos de caixa e eventual evento de titularidade. | Aporte parcelado não cria direito de distribuição ou participação eficaz sem instrumento e evento próprios. |

## 7. Critérios de aceite futuros

| Cenário | Deve permitir | Deve negar |
| --- | --- | --- |
| Cadastrar fazendeiro/proprietário da terra. | Criar Parte e vínculo de origem da terra com instrumento/evidência em andamento. | Criar payable, liberar lote ou conceder acesso financeiro automaticamente. |
| Cadastrar sócio investidor de 20%. | Registrar participação, instrumento, objeto, base e vigência. | Interpretar 20% como direito sobre VGV, caixa, lucro e todos os empreendimentos simultaneamente. |
| Registrar permuta física em `Q12 · L1`. | Criar alocação física e bloqueio de estoque quando o instrumento permitir. | Criar parcela de dinheiro ou disponibilizar o mesmo lote para nova venda. |
| Registrar comissão parcelada. | Criar regra de direito com gatilho, calendário e recebedor. | Marcar como paga antes de instrução, retorno e conciliação. |
| Receber aditivo/cessão. | Criar versão/caso novo e preservar o vínculo anterior. | Sobrescrever partes, valores ou datas históricas sem trilha. |
| Unificar dois parceiros em um grupo. | Criar grupo contratual, objetos compartilhados e visão comum a partir da eficácia. | Exibir dados de participantes/objetos não incluídos ou apagar direitos individuais. |
| Registrar aporte parcelado. | Criar compromisso e marcos independentes com condição, evidência, estado e owner. | Tratar aporte como distribuição ou alterar titularidade automaticamente. |

## Referências internas

[1] [Catálogo de modalidades de Sócios e Parceiros](crm_socios_parceiros_catalogo_modalidades.md)

[2] [Loteadora, recebíveis e distribuição](crm_loteadora_recebiveis_distribuicao.md)

[3] [Subledger da imobiliária](crm_subledger_imobiliaria.md)
